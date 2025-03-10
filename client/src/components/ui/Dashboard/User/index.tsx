import { updatePassword } from '@/api/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { buttonVariants } from '@/lib/config.ts';
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

const UserDashboard = () => {
  const { user, setDashboard } = useSession();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={e => {
        if (!e) setDialogOpen(false);
      }}
    >
      <Tabs
        defaultValue="dashboard"
        className="mt-14 flex w-screen flex-col items-center justify-start"
      >
        <TabsList className="bg-tansparent">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardContent className="w-[350px] bg-white dark:bg-black">
              <div className="mt-4">
                <div className="flex">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="ml-2">{user?.username}</span>
                </div>
                <DialogTrigger onClick={() => setDialogOpen(true)}>
                  <Button className="mt-2" size="sm">
                    Update password
                  </Button>
                </DialogTrigger>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <UpdatePasswordUser
        id={user?.id as string}
        setDialogOpen={setDialogOpen}
      />

              <div className="mt-6 flex justify-center ">
                <Button 
                className={buttonVariants.cancel}
                onClick={() => setDashboard(false)}>
                  Go back to editor
                </Button>
              </div>
    </Dialog>
  );
};

const UpdatePasswordUser = ({
  id,
  setDialogOpen,
}: {
  id: string;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
    <DialogContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
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
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UserDashboard;
