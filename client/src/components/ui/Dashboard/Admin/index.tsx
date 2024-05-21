import { fetchAllUsers } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Register from './Register';
import { columns } from './Columns';
import DataTable from './DataTable';

const AdminDashboard = () => {
  const { data, error, isRefetching, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
  });

  if (isRefetching) {
    refetch();
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        An error occured while fetching users - {error?.message ?? 'Unknown'}{' '}
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="manage"
      className="mt-14 flex w-screen flex-col items-center justify-start"
    >
      <TabsList className="bg-tansparent grid w-[300px] grid-cols-3">
        <TabsTrigger value="manage">Manage users</TabsTrigger>
        <Separator orientation="vertical" className="mx-auto" />
        <TabsTrigger value="register">Register user</TabsTrigger>
      </TabsList>
      <TabsContent value="manage">
        <div className="mt-4">
          <DataTable columns={columns} data={data ?? []} />
        </div>
      </TabsContent>
      <TabsContent value="register" className="h-full">
        <Register />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;
