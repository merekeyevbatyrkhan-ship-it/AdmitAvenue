export class ProfileConflict extends Error {
  constructor(){super('Profile changed on another device.');this.name='ProfileConflict';}
}

// Explicit INSERT / UPDATE respect column grants; never send server-owned fields.
export function createProfileStore(client){
  return {
    async read(userId){
      const {data,error}=await client.from('admit_profiles').select('*').eq('user_id',userId).maybeSingle();
      if(error)throw error;
      return data;
    },
    async write(userId,revision,{profile,step,locale}){
      if(!userId||revision===undefined)throw new Error('Read the account profile before saving.');
      const values={draft:profile,current_step:step,locale};
      const query=revision===null
        ?client.from('admit_profiles').insert({user_id:userId,...values})
        :client.from('admit_profiles').update(values).eq('user_id',userId).eq('revision',revision);
      const {data,error}=await query.select('*').maybeSingle();
      if(error?.code==='23505')throw new ProfileConflict();
      if(error)throw error;
      if(!data)throw new ProfileConflict();
      return data;
    }
  };
}
