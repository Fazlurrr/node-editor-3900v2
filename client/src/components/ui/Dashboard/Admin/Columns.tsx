/* eslint-disable react-refresh/only-export-components */
import { Role, User } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown-menu';
import { Button } from '../../button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select';
import { deleteUser, updatePassword, updateUserRole } from '@/api/auth';
import { queryClient } from '@/main';
import { cn } from '@/lib/utils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../../input';
import { useState } from 'react';
import { updatePasswordAdmin } from '@/lib/schemas';

const UserActions = ({ username, id }: { username: string; id: string }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={e => {
        if (!e) setDialogOpen(false);
      }}
    >
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
          <DropdownMenuItem>
            <DialogTrigger onClick={() => setDialogOpen(true)}>
              Update password
            </DialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdatePasswordAdmin id={id} setDialogOpen={setDialogOpen} />
    </Dialog>
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

  const handleSubmit = async (values: z.infer<typeof updatePasswordAdmin>) => {
    const success = await updatePassword(id, values.password);

    if (success) {
      form.reset();
      setDialogOpen(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Set new password for user</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="mt-6 flex justify-center">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
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
