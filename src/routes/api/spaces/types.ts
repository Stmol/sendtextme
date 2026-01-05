export type CreateSpaceRequest = {
    password: string;
    save: boolean;
};

export type SpacesPostResponse = {
    uid: string;
    expiresAt: string;
    key: string;
    maxNotesCount: number;
};

export type DeleteSpaceRequest = {
    spaceUid: string;
};

export type DeleteSpaceResponse = {
    spaceUid: string;
};
