import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

// .$extends({
//     query: {
//         notes: {
//             $allOperations: async function ({ args, query, operation }) {
//                 const note = (await query(args)) as notes;

//                 // switch (operation) {
//                 //     // TODO: check "create many" and "delete many"
//                 //     case 'create':
//                 //         eventEmitter.emit('db.notes.created', note);
//                 //         break;
//                 //     case 'update':
//                 //         eventEmitter.emit('db.notes.updated', note);
//                 //         break;
//                 //     case 'delete':
//                 //         eventEmitter.emit('db.notes.deleted', note);
//                 //         break;
//                 // }

//                 return note;
//             },
//         },
//     },
// });
