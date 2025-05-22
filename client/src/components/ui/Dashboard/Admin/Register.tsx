import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { register } from '@/api/auth';
import { buttonVariants } from '@/lib/config.ts';
import { Button } from '@/components/ui/Misc/button';

const registerUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
  repeatPassword: z.string(),
  role: z.enum(['user', 'admin']),
}).refine((data) => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ["repeatPassword"],
});

const Register = () => {
  const form = useForm<{ username: string; password: string; repeatPassword: string; role: 'user' | 'admin' }>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: '',
      password: '',
      repeatPassword: '',
      role: 'user',
    },
  });

  const handleSubmit = async (values: { username: string; password: string; repeatPassword: string; role: 'user' | 'admin' }) => {
    if (values.password !== values.repeatPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const registered = await register(values.username, values.password, values.role);
    if (registered) {
      toast.success(`User ${values.username} registered successfully`);
      form.reset();
      window.location.reload(); 
    }
  };

  return (
    <div className="mt-4 w-[350px] p-4" 
        style= {{ border: '1px solid #9facbc', 
        borderRadius: '8px',         
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          className=" dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                            dark:[&_.MuiInputBase-input]:text-[#9facbc]
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                            dark:[&_.MuiInputLabel-root]:text-white
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
          {...form.register("username")}
          error={!!form.formState.errors.username}
          helperText={form.formState.errors.username?.message}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          className=" dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                            dark:[&_.MuiInputBase-input]:text-[#9facbc]
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                            dark:[&_.MuiInputLabel-root]:text-white
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
          {...form.register("password")}
          error={!!form.formState.errors.password}
          helperText={form.formState.errors.password?.message}
        />

        <TextField
          label="Repeat Password"
          type="password"
          variant="outlined"
          fullWidth
          margin='normal'
          className=" dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                            dark:[&_.MuiInputBase-input]:text-[#9facbc]
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                            dark:[&_.MuiInputLabel-root]:text-white
                            dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                            dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
          {...form.register("repeatPassword")}
          error={!!form.formState.errors.repeatPassword}
          helperText={form.formState.errors.repeatPassword?.message}
        />

        <Controller
          control={form.control}
          name="role"
          defaultValue="user"
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth style={{ marginTop: '16px' }} 
              className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
              dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
              dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
              dark:[&_.MuiInputBase-input]:text-[#9facbc]
              dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
              dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
              dark:[&_.MuiInputLabel-root]:text-white
              dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
              dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white">
              <InputLabel>Role</InputLabel>
              <Select
                {...field}
                label="Role"
                error={!!error}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              {error && <FormHelperText error>{error.message}</FormHelperText>}
            </FormControl>
          )}
        />
        <div className="mt-6 flex justify-center">
          <Button className={buttonVariants.confirm} variant="outline" onClick={form.handleSubmit(handleSubmit)}>
            Register user
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Register;