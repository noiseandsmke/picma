import React, {useEffect, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createQuote, deleteQuote, fetchAllQuotes, QuoteDto, updateQuote} from '../services/quoteService';
import {MoreHorizontal, PlusCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

const quoteSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    service: z.string().min(1, 'Service is required'),
    message: z.string(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const AdminQuotesView: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<QuoteDto | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            service: '',
            message: '',
            status: 'PENDING',
        },
    });

    useEffect(() => {
        if (selectedQuote) {
            reset({
                name: selectedQuote.name,
                email: selectedQuote.email,
                phone: selectedQuote.phone,
                address: selectedQuote.address,
                service: selectedQuote.service,
                message: selectedQuote.message,
                status: selectedQuote.status as 'PENDING' | 'APPROVED' | 'REJECTED',
            });
        } else {
            reset({
                name: '',
                email: '',
                phone: '',
                address: '',
                service: '',
                message: '',
                status: 'PENDING',
            });
        }
    }, [selectedQuote, reset]);

    const {
        data: quotes,
        isLoading: isQuotesLoading,
        isError: isQuotesError
    } = useQuery({
        queryKey: ['admin-quotes'],
        queryFn: fetchAllQuotes,
        select: (data) => [...data].sort((a, b) => a.id - b.id)
    });

    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin-quotes']});
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin-quotes']});
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin-quotes']});
        },
    });

    const onSubmit = (data: QuoteFormData) => {
        if (selectedQuote) {
            updateMutation.mutate({...selectedQuote, ...data});
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (quote: QuoteDto) => {
        setSelectedQuote(quote);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedQuote(null);
        reset();
        setIsModalOpen(true);
    };

    const getStatusClass = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20';
            case 'APPROVED':
                return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">All Quotes</h3>
                            <p className="text-sm text-slate-400">Manage and track all customer quotes.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} variant="outline"
                                    className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white">
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Create Quote
                            </Button>
                        </div>
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50 border-slate-800">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400 w-[80px]">ID</TableHead>
                                    <TableHead className="text-slate-400">Name</TableHead>
                                    <TableHead className="text-slate-400">Email</TableHead>
                                    <TableHead className="text-slate-400">Phone</TableHead>
                                    <TableHead className="text-slate-400">Address</TableHead>
                                    <TableHead className="text-slate-400">Service</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isQuotesLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-8 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isQuotesError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={8} className="h-24 text-center text-red-400">
                                            Failed to load quotes data.
                                        </TableCell>
                                    </TableRow>
                                ) : quotes && quotes.length > 0 ? (
                                    quotes.map((quote) => (
                                        <TableRow key={quote.id}
                                                  className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                            <TableCell
                                                className="font-medium text-slate-300">{quote.id}</TableCell>
                                            <TableCell className="text-slate-300">{quote.name}</TableCell>
                                            <TableCell className="text-slate-300">{quote.email}</TableCell>
                                            <TableCell className="text-slate-300">{quote.phone}</TableCell>
                                            <TableCell className="text-slate-300">{quote.address}</TableCell>
                                            <TableCell className="text-slate-300">{quote.service}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline"
                                                       className={cn("border-0 font-medium", getStatusClass(quote.status))}>
                                                    {quote.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end"
                                                                         className="bg-slate-900 border-slate-800 text-slate-200">
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(quote)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => deleteMutation.mutate(quote.id)}
                                                            className="text-red-400">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                            No quotes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>{selectedQuote ? 'Edit Quote' : 'Create Quote'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" {...register('name')} className="bg-slate-900 border-slate-700"/>
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" {...register('email')}
                                           className="bg-slate-900 border-slate-700"/>
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...register('phone')}
                                           className="bg-slate-900 border-slate-700"/>
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" {...register('address')}
                                           className="bg-slate-900 border-slate-700"/>
                                    {errors.address &&
                                        <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="service">Service</Label>
                                <Input id="service" {...register('service')}
                                       className="bg-slate-900 border-slate-700"/>
                                {errors.service && <p className="text-red-500 text-sm">{errors.service.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Input id="message" {...register('message')}
                                       className="bg-slate-900 border-slate-700"/>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({field}) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700">
                                                <SelectValue placeholder="Select status"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="APPROVED">Approved</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}>
                                    {selectedQuote ? 'Save Changes' : 'Create Quote'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminQuotesView;