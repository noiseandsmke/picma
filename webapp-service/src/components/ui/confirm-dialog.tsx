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
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-200">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        {variant === 'destructive' && (
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-500"/>
                            </div>
                        )}
                        <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className={variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}