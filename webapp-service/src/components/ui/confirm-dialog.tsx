import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {AlertTriangle} from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
                                  open,
                                  onOpenChange,
                                  title = 'Are you sure?',
                                  description = 'This action cannot be undone.',
                                  onConfirm,
                                  confirmText = 'Confirm',
                                  cancelText = 'Cancel',
                                  variant = 'default',
                              }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-surface-main border-border-main text-text-main">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        {variant === 'destructive' && (
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-500"/>
                            </div>
                        )}
                        <DialogTitle className="text-lg font-semibold text-text-main">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-text-muted">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-text-muted hover:text-text-main hover:bg-muted"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        {confirmText}
                    </Button>
                    Riverside: removed redundant manual class overrides.
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}