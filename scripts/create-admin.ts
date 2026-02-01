import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'; // Import dotenv
dotenv.config({ path: '.env.local' }); // Load .env.local

console.log('DEBUG: SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY (partial):', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' : 'Not Set');

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ SECRET
)

async function createAdmin() {
  const email = 'agrilends@gmail.com'
  const password = 'daouda' // Utiliser un mot de passe fort en production

  // 1️⃣ Créer l'utilisateur s'il n'existe pas
  // email_confirm: true signifie qu'il devra confirmer son email.
  // Pour un admin créé par script, on peut le mettre à false si on veut éviter la confirmation.
  // Pour cet exemple, je garde email_confirm: true comme dans la proposition.
  const { data: userData, error: userError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

  if (userError && !userError.message.includes('already registered')) {
    throw userError
  }

  // Récupérer l'ID de l'utilisateur (soit celui qui vient d'être créé, soit l'existant)
  const userId =
    userData?.user?.id ??
    (
      await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()
    ).data.id

  // 2️⃣ Créer / mettre à jour le profil admin dans la table public.profiles
  await supabase
    .from('profiles')
    .upsert({
      id: userId,
      name: 'Agrilends Admin',
      role: 'admin'
    }, { onConflict: 'id' }) // Utiliser onConflict: 'id' pour upsert

  console.log('✅ Admin prêt :', email)
}

createAdmin().catch(console.error)
