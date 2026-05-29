import{c as d}from"./createLucideIcon-X-oWGkMW.js";import{C as l,w as i}from"./index-qutNgf5D.js";/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=d("FileTextIcon",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]),c={async getDocenteId(r){const{data:a,error:e}=await l.from("docentes").select("id").eq("usuario_id",r).maybeSingle();if(e)throw e;return a==null?void 0:a.id},async getAssignedParallels(r){const{data:a,error:e}=await l.from("paralelos").select(`
        *,
        materias (nombre, codigo),
        periodos_academicos (nombre)
      `).eq("docente_id",r).eq("activo",!0);if(e)throw console.error("Error fetching assigned parallels:",e),e;return a||[]},async getParallelStudents(r){const{data:a,error:e}=await l.from("inscripciones").select(`
        *,
        estudiantes:estudiante_id (
          id,
          registro_universitario,
          usuarios:usuario_id (nombres, apellidos, email)
        )
      `).eq("paralelo_id",r);if(e)throw console.error("Error fetching parallel students:",e),e;return(a||[]).map(t=>({...t,student_name:`${t.estudiantes.usuarios.nombres} ${t.estudiantes.usuarios.apellidos}`,student_email:t.estudiantes.usuarios.email,registro:t.estudiantes.registro_universitario}))},async saveGrade(r,a){const e=(a.nota_primer_parcial+a.nota_segundo_parcial+a.nota_examen_final)/3,{data:t,error:n}=await l.from("inscripciones").update({...a,promedio_final:e}).eq("id",r).select().single();if(n)throw console.error("Error saving grade:",n),n;return t}},y=()=>{const r=i([]),a=i([]),e=i(!1),t=i(null);return{parallels:r,currentStudents:a,loading:e,error:t,fetchDocenteId:async s=>{try{return await c.getDocenteId(s)}catch(o){return t.value=o.message,null}},fetchAssignedParallels:async s=>{e.value=!0;try{r.value=await c.getAssignedParallels(s)}catch(o){t.value=o.message}finally{e.value=!1}},fetchParallelStudents:async s=>{e.value=!0;try{a.value=await c.getParallelStudents(s)}catch(o){t.value=o.message}finally{e.value=!1}},saveGrade:async(s,o)=>{try{await c.saveGrade(s,o)}catch(u){t.value=u.message}}}};export{v as F,y as u};
