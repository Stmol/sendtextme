import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    return {};
};

// export const actions = {
// 	createNote: async ({ request }) => {
// 		const content = "test content";
// 		const uid = "1";

// 		const note = await prisma.notes.create({
// 			data: {
// 				content,
// 				uid,
// 			},
// 		});

// 		return {
// 			note,
// 		};
// 	},
// } satisfies Actions;
