import { updatePassword } from '@/api/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/lib/config.ts';
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
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { updatePasswordUser } from '@/lib/schemas';
import { useTheme } from '@/hooks';
import { X } from 'lucide-react';

const UserDashboard = () => {
  const { user, setDashboard } = useSession();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <Tabs
        defaultValue="dashboard"
        className="mt-14 flex w-screen flex-col items-center justify-start"
      >
        <TabsList className="bg-transparent">
          <TabsTrigger value="dashboard" className="text-lg">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardContent>
              <div className="mt-4">
                <div className="flex">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="ml-2">{user?.username}</span>
                </div>
                <Button 
                  className={`mt-2 ${buttonVariants.cancel}`} 
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  Update password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {dialogOpen && (
        <UpdatePasswordUser
          id={user?.id as string}
          setDialogOpen={setDialogOpen}
        />
      )}

      <div className="mt-6 flex justify-center">
        <Button 
          className={buttonVariants.cancel}
          onClick={() => setDashboard(false)}
        >
          Go back to editor
        </Button>
      </div>
    </div>
  );
};

const UpdatePasswordUser = ({
  id,
  setDialogOpen,
}: {
  id: string;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { theme } = useTheme();
  const form = useForm<z.infer<typeof updatePasswordUser>>({
    resolver: zodResolver(updatePasswordUser),
    defaultValues: {
      currentPassword: '',
      password: '',
      repeatPassword: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof updatePasswordUser>) => {
    const success = await updatePassword(
      id,
      values.password,
      values.currentPassword
    );

    if (success) {
      form.reset();
      setDialogOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-50 fixed inset-0 z-40`}
        onClick={() => setDialogOpen(false)}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
        <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold'>
                Change Password
              <span className="cursor-pointer" title='Close' onClick={() => setDialogOpen(false)}>
                <X size={18} />
              </span>
        </div>
        <Form {...form}>
          <form className='px-4 pb-4' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
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
              <Button className={`w-1/2 ${buttonVariants.confirm}`}>
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UserDashboard;