import { fetchAllUsers } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Register from './Register';
import { columns } from './Columns';
import DataTable from './DataTable';
import { Button } from '../../button';
import { buttonVariants } from '@/lib/config.ts';
import { SetStateAction, useState } from 'react';
import { storeSelector, useStore, useTheme } from '@/hooks';
import {
  ControlsStyled,
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';

const AdminDashboard = () => {
  const { theme } = useTheme();
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
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
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
          <Button className={buttonVariants.cancel} >
            Go back to editor
          </Button>
          </div>
      </Tabs>
    </ThemeProvider>
  );
};

export default AdminDashboard;
