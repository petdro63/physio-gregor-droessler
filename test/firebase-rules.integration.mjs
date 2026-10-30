import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch, setLogLevel } from 'firebase/firestore';

setLogLevel('silent');
const env=await initializeTestEnvironment({projectId:'demo-physio-test',firestore:{host:'127.0.0.1',port:8180,rules:fs.readFileSync('firestore.rules','utf8')}});
test.after(()=>env.cleanup());
test.beforeEach(()=>env.clearFirestore());
const db=(uid='owner',claims={trainingDemo:true})=>env.authenticatedContext(uid,claims).firestore();
const row=(ownerUid='owner')=>({schemaVersion:1,ownerUid,revision:1,payload:'{}',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
const create=async(database=db())=>{const ref=doc(database,'demoStates','owner');await assertSucceeds(setDoc(ref,row()));return ref;};
const uuid='d5bdcb58-9c26-4197-bc52-af31f64d69ef';
const metadata=()=>({ownerUid:'owner',mediaId:uuid,mime:'image/webp',size:3,chunks:1,createdAt:serverTimestamp()});
const chunk=()=>({ownerUid:'owner',mediaId:uuid,index:0,data:'YWJj',createdAt:serverTimestamp()});

test('rules deny public queries, unapproved signups, other owners and role self-escalation',async()=>{
  await create();
  const anonymous=env.unauthenticatedContext().firestore(),outsider=db('outsider'),unapproved=db('owner',{});
  for(const database of [anonymous,outsider,unapproved]){
    await assertFails(getDoc(doc(database,'demoStates','owner')));
    await assertFails(getDocs(collection(database,'demoStates')));
    await assertFails(setDoc(doc(database,'demoStates','owner'),row()));
  }
  await assertFails(setDoc(doc(db('owner',{}),'users','owner'),{role:'admin',trainingDemo:true}));
  await assertFails(setDoc(doc(db('outsider',{}),'demoStates','outsider'),row('outsider')));
  await assertSucceeds(getDoc(doc(db(),'demoStates','owner')));
});
test('rules validate create and update equally, reject every required-field omission and unknown schema fields',async()=>{
  const invalid=[
    {ownerUid:'other'}, {revision:0}, {revision:2}, {schemaVersion:2}, {schemaVersion:'1'}, {payload:42}, {payload:'x'.repeat(850001)},
    {createdAt:Timestamp.fromMillis(0)}, {updatedAt:Timestamp.fromMillis(0)}, {extra:'injected'},
  ];
  for(const patch of invalid)await assertFails(setDoc(doc(db(),'demoStates','owner'),{...row(),...patch}));
  for(const key of Object.keys(row())){const data=row();delete data[key];await assertFails(setDoc(doc(db(),'demoStates','owner'),data));}
  const ref=await create();
  for(const patch of [{ownerUid:'other'},{schemaVersion:2},{payload:42},{payload:'x'.repeat(850001)},{createdAt:Timestamp.fromMillis(0)},{updatedAt:Timestamp.fromMillis(0)},{extra:'injected'}])
    await assertFails(updateDoc(ref,{revision:2,updatedAt:serverTimestamp(),...patch}));
  for(const key of Object.keys(row())){const data={...row(),revision:2};delete data[key];await assertFails(setDoc(ref,data));}
});
test('rules enforce immutable owner/creation time, request timestamps, sequential revisions and preserve workspace',async()=>{
  const ref=await create(),before=(await getDoc(ref)).data();
  await assertFails(updateDoc(ref,{payload:'{"ok":true}',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(ref,{revision:3,updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(ref,{revision:2,updatedAt:Timestamp.fromMillis(Date.now()+86400000)}));
  await assertSucceeds(updateDoc(ref,{revision:2,payload:'{"ok":true}',updatedAt:serverTimestamp()}));
  assert((await getDoc(ref)).data().createdAt.isEqual(before.createdAt));
  await assertFails(updateDoc(ref,{revision:2,updatedAt:serverTimestamp()}));
  await assertFails(deleteDoc(ref));
});
test('rules prevent ownership hijacks and mixed private data reads between two approved demo accounts',async()=>{
  await create();const other=db('other');await assertSucceeds(setDoc(doc(other,'demoStates','other'),row('other')));
  await assertFails(getDoc(doc(other,'demoStates','owner')));await assertFails(getDoc(doc(db(),'demoStates','other')));
  await assertFails(updateDoc(doc(other,'demoStates','owner'),{ownerUid:'other',revision:2,updatedAt:serverTimestamp()}));
});
test('rules reject orphaned media and chunks, validate content limits and permit the actual atomic upload',async()=>{
  const database=db(),mediaRef=doc(database,'demoStates','owner','media',uuid),chunkRef=doc(mediaRef,'chunks','0');
  await assertFails(setDoc(mediaRef,metadata()));await assertFails(setDoc(chunkRef,chunk()));
  await create(database);
  await assertFails(setDoc(chunkRef,chunk()));
  for(const patch of [{ownerUid:'other'},{mime:'text/html'},{size:-1},{size:52428801},{chunks:0},{chunks:101},{mediaId:'../escape'},{extra:'x'}])
    await assertFails(setDoc(mediaRef,{...metadata(),...patch}));
  for(const key of Object.keys(metadata())){const data=metadata();delete data[key];await assertFails(setDoc(mediaRef,data));}
  const batch=writeBatch(database);batch.set(mediaRef,metadata());batch.set(chunkRef,chunk());await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(chunkRef));await assertFails(updateDoc(chunkRef,{data:'ZGVm'}));await assertFails(updateDoc(mediaRef,{size:6}));
  await assertFails(getDoc(doc(db('other'),'demoStates','owner','media',uuid,'chunks','0')));
});
test('rules reject chunk replay, corrupt types, missing fields, oversized base64, index overflow and forged paths',async()=>{
  const database=db();await create(database);
  const mediaRef=doc(database,'demoStates','owner','media',uuid);await setDoc(mediaRef,metadata());
  const chunkRef=doc(mediaRef,'chunks','0');
  for(const patch of [{index:-1},{index:1},{index:'0'},{ownerUid:'other'},{mediaId:'../escape'},{data:'x'.repeat(800004)},{data:'bad!'},{data:42},{createdAt:Timestamp.fromMillis(0)},{extra:'x'}])
    await assertFails(setDoc(chunkRef,{...chunk(),...patch}));
  for(const key of Object.keys(chunk())){const data=chunk();delete data[key];await assertFails(setDoc(chunkRef,data));}
  await assertFails(setDoc(doc(mediaRef,'chunks','01'),chunk()));
  await assertSucceeds(setDoc(chunkRef,chunk()));await assertFails(setDoc(chunkRef,chunk()));
  await assertSucceeds(deleteDoc(chunkRef));await assertSucceeds(deleteDoc(mediaRef));
  // The browser upload also supports multiple bounded requests per file.
  await assertSucceeds(setDoc(mediaRef,{...metadata(),size:6,chunks:2}));
  const first=writeBatch(database);first.set(chunkRef,chunk());await assertSucceeds(first.commit());
  const second=writeBatch(database);second.set(doc(mediaRef,'chunks','1'),{...chunk(),index:1});await assertSucceeds(second.commit());
  await assertSucceeds(getDoc(doc(mediaRef,'chunks','1')));
});
