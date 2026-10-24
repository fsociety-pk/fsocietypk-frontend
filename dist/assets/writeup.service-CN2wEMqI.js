import{c as n}from"./index-LEPocBbD.js";import{a as r}from"./apiClient-3Zo_1bqS.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=n("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]),c={submitWriteup:async t=>{const{data:e}=await r.post("/writeups",t);return e},getWriteupsForChallenge:async(t,e=1,a=10)=>{const{data:s}=await r.get(`/writeups/challenge/${t}`,{params:{page:e,limit:a}});return s},getUserWriteups:async(t=1,e=10)=>{const{data:a}=await r.get("/writeups/user/me",{params:{page:t,limit:e}});return a},getWriteupById:async t=>{const{data:e}=await r.get(`/writeups/${t}`);return e},updateWriteup:async(t,e)=>{const{data:a}=await r.put(`/writeups/${t}`,e);return a},deleteWriteup:async t=>{const{data:e}=await r.delete(`/writeups/${t}`);return e},getPendingWriteups:async(t=1,e=10)=>{const{data:a}=await r.get("/writeups/admin/pending",{params:{page:t,limit:e}});return a},approveWriteup:async t=>{const{data:e}=await r.put(`/writeups/${t}/approve`);return e},rejectWriteup:async(t,e)=>{const{data:a}=await r.put(`/writeups/${t}/reject`,{adminNotes:e});return a}};export{u as A,c as w};
//# sourceMappingURL=writeup.service-CN2wEMqI.js.map
