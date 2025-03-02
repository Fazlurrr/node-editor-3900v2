import { login } from '@/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { TextField } from '@mui/material';

const formSchema = z.object({
  username: z.string().min(2, 'Username must contain at least 2 character(s)'),
  password: z.string().min(2, 'Password must contain at least 2 character(s)'),
});

const Login = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) =>
    await login(values.username, values.password);

  return (
    <section className="flex h-screen w-screen items-center justify-center">
      <Card className="w-[350px] border-2 border-[#9FACBC]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                    <TextField
                    {...field}
                    label="username"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    className=" dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                    <TextField
                    {...field}
                    type="password"
                    label="password"
                    variant="outlined"
                    fullWidth
                    className=" dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
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
                <Button className={buttonVariants({ variant: 'default' })} onClick={ form.handleSubmit(handleSubmit)}>
                          Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};

export default Login;
