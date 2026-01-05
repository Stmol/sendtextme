import prisma from '$lib/server/prisma';

export type SpacePassword = {
    spaceUid: string;
    password: string;
};

export type SpaceAccess = {
    spaceUid: string;
    access: boolean;
};

export const validateSpacesPasswords = async (
    passwords: SpacePassword[],
): Promise<SpacePassword[]> => {
    const where = passwords.map((password) => ({
        uid: password.spaceUid,
        password: password.password,
    }));

    const spaces = await prisma.spaces.findMany({
        where: {
            AND: where,
        },
    });

    return passwords.filter(
        (password) =>
            !spaces.some(
                (space) => space.uid === password.spaceUid && space.password === password.password,
            ),
    );
};

export const createSpaceAccessMap = async (passwords: SpacePassword[]): Promise<SpaceAccess[]> => {
    const spaces = await prisma.spaces.findMany({
        where: {
            uid: {
                in: passwords.map((password) => password.spaceUid),
            },
        },
        take: 10,
    });

    return (
        spaces &&
        spaces.map((space) => ({
            spaceUid: space.uid,
            access: passwords.some(
                (password) =>
                    password.spaceUid === space.uid && password.password === space.password,
            ),
        }))
    );
};

export const checkSpaceAccess = (spaceUid: string, access: SpaceAccess[]): boolean => {
    return access.some((a) => a.spaceUid === spaceUid && a.access);
};
