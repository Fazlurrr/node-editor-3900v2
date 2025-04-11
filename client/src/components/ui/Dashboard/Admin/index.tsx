import { fetchAllUsers } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Misc/tabs';
import { Separator } from '@/components/ui/Misc/separator';
import Register from './Register';
import { columns } from './Columns';
import DataTable from './DataTable';
import { Button } from '@/components/ui/Misc/button';
import { buttonVariants } from '@/lib/config.ts';
import { SetStateAction, useState } from 'react';
import { useSession } from '@/hooks';


const AdminDashboard = () => {
  const { setDashboard } = useSession();
  const [selectedTab, setSelectedTab] = useState('manage');
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

  const handleTabChange = (newTab: SetStateAction<string>) => {
    setSelectedTab(newTab);
    refetch();
  };

  return (
    <Tabs defaultValue={selectedTab} 
          onValueChange={handleTabChange} 
          className="mt-14 flex w-screen flex-col items-center justify-start"
    >
      <TabsList className="bg-transparent grid w-[300px] grid-cols-3">
        <TabsTrigger value="manage" style={{ fontSize: '1.25rem' }}>Manage users</TabsTrigger>
        <Separator orientation="vertical" className="mx-auto" />
        <TabsTrigger value="register" style={{ fontSize: '1.25rem' }}>Register user</TabsTrigger>
    </TabsList>

      <TabsContent value="manage">
        <div className="mt-4">
          <DataTable columns={columns} data={data ?? []} />
        </div>
      </TabsContent>
      <TabsContent value="register" className="h-full">
        <Register />
      </TabsContent>

      <div className="mt-6 flex justify-center ">
        <Button 
        className={buttonVariants.cancel}
        onClick={() => setDashboard(false)}>
          Go back to editor
        </Button>
      </div>
    </Tabs>
  );
};

export default AdminDashboard;
