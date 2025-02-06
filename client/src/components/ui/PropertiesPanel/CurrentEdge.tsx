import { useState } from 'react';
import { Button } from '../button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '../select';
import { deleteEdge, updateEdge } from '@/api/edges';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { EdgeType } from '@/lib/types';
import toast from 'react-hot-toast';
import { useStore } from '@/hooks';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

interface CurrentEdgeProps {
  currentEdge: any;
}

const CurrentEdge: React.FC<CurrentEdgeProps> = ({ currentEdge }) => {
  const { nodes } = useStore();
  const sourceNode = nodes.find((node: any) => node.id === currentEdge.source);
  const targetNode = nodes.find((node: any) => node.id === currentEdge.target);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleConnectionTypeChange = async (newEdgeType: EdgeType) => {
    const updatedEdge = await updateEdge(currentEdge.id, newEdgeType);
    if (updatedEdge) {
      await updateNodeConnectionData(
        currentEdge.source,
        currentEdge.target,
        currentEdge.type,
        newEdgeType
      );
      currentEdge.type = newEdgeType;
    }
  };

  const handleDeleteEdge = async () => {
    const deleted = await deleteEdge(currentEdge.id);
    if (deleted) {
      toast.success('Edge deleted');
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="px-4">
      <div className="mb-2">
        <strong>Edge from</strong>
        <div>{sourceNode ? sourceNode.data.label : currentEdge.source}</div>
        <strong>To</strong>
        <div>{targetNode ? targetNode.data.label : currentEdge.target}</div>
      </div>
      <div className="mb-4">
        <strong>Connection Type:</strong>
        <Select 
          value={currentEdge.type} 
          onValueChange={(value) => handleConnectionTypeChange(value as EdgeType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>{currentEdge.type}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={EdgeType.Part}>Part of</SelectItem>
              <SelectItem value={EdgeType.Connected}>Connected to</SelectItem>
              <SelectItem value={EdgeType.Fulfilled}>Fulfilled by</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button
        className="mt-4 bg-red-500 text-white w-full"
        variant="outline"
        onClick={() => setShowDeleteDialog(true)}
      >
        Delete
      </Button>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        elementType="edge"
        onConfirm={handleDeleteEdge}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default CurrentEdge;
