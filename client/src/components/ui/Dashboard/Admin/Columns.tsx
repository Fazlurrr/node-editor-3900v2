import { Role, User } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/Misc/dropdown-menu';
import { Button } from '../../Misc/button';
import { buttonVariants } from '@/lib/config.ts';
import { ArrowUpDown, MoreHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Misc/select';
import { deleteUser, updatePassword, updateUserRole } from '@/api/auth';
import { queryClient } from '@/main';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Misc/form';
import { useState } from 'react';
import { updatePasswordAdmin } from '@/lib/schemas';
import { TextField } from '@mui/material';
import { useTheme } from '@/hooks';

const UserActions = ({ username, id }: { username: string; id: string }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className={cn('', {
              hidden: username === 'admin',
            })}
            onClick={() => {
              deleteUser(id);
              queryClient.invalidateQueries({
                queryKey: ['users'],
              });
            }}
          >
            Delete user
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            Update password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogOpen && (
        <UpdatePasswordAdmin id={id} setDialogOpen={setDialogOpen} />
      )}
    </>
  );
};

const UpdatePasswordAdmin = ({
  id,
  setDialogOpen,
}: {
  id: string;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const form = useForm<z.infer<typeof updatePasswordAdmin>>({
    resolver: zodResolver(updatePasswordAdmin),
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
  });
  const { theme } = useTheme();

  const handleSubmit = async (values: z.infer<typeof updatePasswordAdmin>) => {
    const success = await updatePassword(id, values.password);

    if (success) {
      form.reset();
      setDialogOpen(false);
    }
  };

  return (
    <>
      <div 
        className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-50 fixed inset-0 z-40`}
        onClick={() => setDialogOpen(false)}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/5 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
        <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold'>
              Update password
            <span className="cursor-pointer" title='Close'>
              <X size={18} />
            </span>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-8 pb-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
              <FormItem>
                <FormControl>
                <TextField
                  {...field}
                  type="password"
                  label="New password"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                      dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                      dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                      dark:[&_.MuiInputBase-input]:text-[#9facbc]
                      dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                      dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                      dark:[&_.MuiInputLabel-root]:text-white
                      dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                      dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
                />
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeatPassword"
              render={({ field }) => (
              <FormItem>
                <FormControl>
                <TextField
                  {...field}
                  type="password"
                  label="Repeat password"
                  variant="outlined"
                  fullWidth
                  className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                      dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                      dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                      dark:[&_.MuiInputBase-input]:text-[#9facbc]
                      dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                      dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                      dark:[&_.MuiInputLabel-root]:text-white
                      dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                      dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
                />
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
              )}
            />
            <div className="mt-6 flex justify-center">
              <Button className={buttonVariants.confirm} type="submit">
              Update password
              </Button>
            </div>
            </form>
        </Form>
      </div>
    </>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'username',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, getValue }) => {
      const role = getValue() as string;
      const { id, username } = row.original;
      return (
        <Select
          disabled={username === 'admin'}
          value={role}
          onValueChange={e => {
            updateUserRole(id, e as Role);
            queryClient.invalidateQueries({
              queryKey: ['users'],
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={role} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const { id, username } = row.original;
      return <UserActions id={id} username={username} />;
    },
  },
];
