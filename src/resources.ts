const firebase=import.meta.env.VITE_BACKEND==='firebase';
let uploadedUrl:(id:string)=>string=()=>'';
let uploadedType:(id:string)=>string=()=>'';
export function registerMediaResolver(url:(id:string)=>string,type:(id:string)=>string){uploadedUrl=url;uploadedType=type;}
export function resourceUrl(path:string) {
  if(!firebase)return path;
  const url=new URL(path,location.origin);
  let match=url.pathname.match(/^\/api\/reference-poses\/[^/]+\/([^/]+)$/);
  if(match){const atlas=match[1],frame=url.searchParams.get('frame');const extension=atlas.startsWith('reference-hws-')?'svg':/^reference-(shoulder-rotation-|bulgarian-)/.test(atlas)||atlas==='reference-hip-flexor-stretch'?'webp':'png';return `/demo-assets/reference/${atlas}${frame!==null?'-frame'+frame:''}.${extension}`;}
  match=url.pathname.match(/^\/api\/catalog-media\/[^/]+\/([^/]+)\/([^/]+)$/);
  if(match)return `/demo-assets/catalog/${match[1]}/${match[2]}`;
  match=url.pathname.match(/^\/api\/demo-media\/[^/]+\/([^/]+)$/);
  if(match)return `/demo-assets/${match[1]}`;
  match=url.pathname.match(/^\/api\/media\/([^/]+)$/);
  return match?uploadedUrl(match[1]):path;
}
export async function mediaFetch(path:string,init?:RequestInit) {
  if(!firebase)return fetch(path,init);
  const id=/^\/api\/media\/([^/]+)$/.exec(path)?.[1];
  if(id&&init?.method==='HEAD')return new Response(null,{status:uploadedUrl(id)?200:404,headers:{'Content-Type':uploadedType(id)||'application/octet-stream'}});
  return fetch(resourceUrl(path),init);
}
