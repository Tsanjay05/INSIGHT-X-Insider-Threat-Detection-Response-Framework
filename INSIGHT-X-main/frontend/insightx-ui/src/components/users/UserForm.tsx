import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { UserRole, UserStatus } from '@/api/users.types';
import { useEffect } from 'react';

// Form Schema
const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    department: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(), // Only for editing
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    defaultValues?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => Promise<void>;
    isLoading?: boolean;
    isEditing?: boolean;
}

export function UserForm({ defaultValues, onSubmit, isLoading, isEditing = false }: UserFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            role: UserRole.VIEWER,
            status: UserStatus.ACTIVE,
            department: '',
            ...defaultValues,
        },
    });

    // Reset form when defaultValues change (e.g., when opening edit modal for different user)
    useEffect(() => {
        if (defaultValues) {
            reset({
                name: '',
                email: '',
                role: UserRole.VIEWER,
                status: UserStatus.ACTIVE,
                department: '',
                ...defaultValues,
            });
        }
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
            />

            <FormInput
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
            // Disable email editing in 'edit' mode if it's considered immutable, 
            // but typically it's allowed. If not, add disabled={isEditing}
            />

            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Role</label>
                <select
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register('role')}
                >
                    {Object.values(UserRole).map((role) => (
                        <option key={role} value={role}>
                            {role.replace('_', ' ')}
                        </option>
                    ))}
                </select>
                {errors.role && (
                    <p className="text-xs text-semantic-danger-400">{errors.role.message}</p>
                )}
            </div>

            {isEditing && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Status</label>
                    <select
                        className="w-full px-3 py-2 bg-bg-tertiary border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        {...register('status')}
                    >
                        {Object.values(UserStatus).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <FormInput
                label="Department"
                placeholder="Security Operations"
                error={errors.department?.message}
                {...register('department')}
            />

            <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" loading={isLoading}>
                    {isEditing ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
}
