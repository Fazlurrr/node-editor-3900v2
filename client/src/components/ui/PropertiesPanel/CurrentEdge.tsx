import { useState } from 'react';
import { Button } from '../button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '../select';
import { deleteEdge, updateEdge } from '@/api/edges';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { EdgeType } from '@/lib/types';
import toast from 'react-hot-toast';
import { useStore } from '@/hooks';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { buttonVariants } from '@/lib/config';

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
    <div className="">
      <div className="mb-1 px-4 p-4 flex items-center">
        <strong>Edge from:</strong>
        <div className="ml-2 text-black-600">
          {sourceNode ? sourceNode.data.label : currentEdge.source}
        </div>
      </div>
      <div className="mb-0 px-4 pb-4 flex items-center">
        <strong>To:</strong>
        <div className="ml-2 text-black-600">
          {targetNode ? targetNode.data.label : currentEdge.target}
        </div>
      </div>
      <div className="mb-4 px-4 pb-4 border-b border-[#9facbc]">
        <strong>Relation Type:</strong>
        <div className="mb-2"></div>
        <Select 
          value={currentEdge.type} 
          onValueChange={(value) => handleConnectionTypeChange(value as EdgeType)}
        >
          <SelectTrigger className="w-[180px] p-3">
            <SelectValue>
              {(() => {
              switch (currentEdge.type) {
                case EdgeType.Connected:
                return 'Connected to';
                case EdgeType.Transfer:
                return 'Transferred to';
                case EdgeType.Part:
                return 'Part of';
                case EdgeType.Specialization:
                return 'Specialization';
                case EdgeType.Fulfilled:
                return 'Fulfills';
                case EdgeType.Proxy:
                return 'Proxy';
                case EdgeType.Projection:
                return 'Projection';
                case EdgeType.Equality:
                return 'Same as';
                default:
                return currentEdge.type;
              }
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={EdgeType.Connected}>Connected to</SelectItem>
              <SelectItem value={EdgeType.Transfer}>Transferred to</SelectItem>
              <SelectItem value={EdgeType.Part}>Part of</SelectItem>
              <SelectItem value={EdgeType.Specialization}>Specialization</SelectItem>
              <SelectItem value={EdgeType.Fulfilled}>Fulfills</SelectItem>
              <SelectItem value={EdgeType.Proxy}>Proxy</SelectItem>
              <SelectItem value={EdgeType.Projection}>Projection</SelectItem>
              <SelectItem value={EdgeType.Equality}>Same as</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="mx-4 mb-4">
              <Button className={buttonVariants.danger} variant="outline" onClick={() => setShowDeleteDialog(true)}>
                Delete Edge
              </Button>
            </div>
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
