import bcrypt from 'bcrypt'

const senhaDigitada = '123456' // a senha que você ACHA que devia funcionar
const hashDoBanco = '$2b$10$doKRkyRhH1Gd1vtR3HL7de1s39r7ehNfoeimF/Y3GOuntQp1UfZp0' // copie exatamente da tabela

const resultado = await bcrypt.compare(senhaDigitada, hashDoBanco)
console.log(resultado) // true ou false