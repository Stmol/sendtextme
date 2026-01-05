export interface PasswordDialogProps {
    password: string;
    title?: string;
    description?: string;
    submitButtonText?: string;
    checkboxTitle?: string;
    isLoading?: boolean;
    isError?: boolean;
    onSubmit: (isSave: boolean) => void;
}

export interface DialogProps {
    children?: () => any;
    isShowing?: boolean;
    isDismissable?: boolean;
    onDismiss?: () => void;
}
