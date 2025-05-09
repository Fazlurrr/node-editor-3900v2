import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '../Misc/select';
import { updateEdge } from '@/api/edges';
import { switchEdgeDirection } from '@/lib/utils/edges';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { EdgeType } from '@/lib/types';
import { Trash2, ArrowLeftRight } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { useStore } from '@/hooks';
import type { Edge } from 'reactflow';

interface CurrentRelationProps {
  currentRelation: any;
}

const CurrentRelation: React.FC<CurrentRelationProps> = ({ currentRelation }) => {
  const { nodes } = useStore();
  const sourceNode = nodes.find((n: any) => n.id === currentRelation.source);
  const targetNode = nodes.find((n: any) => n.id === currentRelation.target);
  const { handleTriggerDelete } = useClipboard();

  const handleConnectionTypeChange = async (newEdgeType: EdgeType) => {
    const updatedEdge = await updateEdge(currentRelation.id, newEdgeType);
    if (updatedEdge) {
      await updateNodeConnectionData(
        currentRelation.source,
        currentRelation.target,
        currentRelation.type,
        newEdgeType
      );
      currentRelation.type = newEdgeType;
    }
  };

  const handleSwitchDirection = async () => {
    const updated = await switchEdgeDirection({ edge: currentRelation as Edge & { type: EdgeType } });
    if (!updated) return;

    currentRelation.id           = updated.id;
    currentRelation.source       = updated.source;
    currentRelation.target       = updated.target;
    currentRelation.sourceHandle = updated.sourceHandle!;
    currentRelation.targetHandle = updated.targetHandle!;
  };

  return (
    <div>
      {/* Top row: labels on left, icons on right */}
      <div className="mb-2 p-4 border-b border-[#9facbc]">
        <div className="flex justify-between items-start">
          {/* From/To column */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <strong>From:</strong>
              <div className="ml-2 text-black-600 break-all whitespace-normal">
                {sourceNode
                  ? sourceNode.data.customName || sourceNode.data.label
                  : currentRelation.source}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <strong>To:</strong>
              <div className="ml-2 text-black-600 break-all whitespace-normal">
                {targetNode
                  ? targetNode.data.customName || targetNode.data.label
                  : currentRelation.target}
              </div>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            <Trash2
              size={18}
              className="text-red-700 cursor-pointer"
              title="Delete Relation"
              onClick={handleTriggerDelete}
            />
            <ArrowLeftRight
              size={18}
              className="text-blue-700 cursor-pointer"
              title="Switch direction"
              onClick={handleSwitchDirection}
            />
          </div>
        </div>
      </div>

      {/* Relation Type selector */}
      <div className="mb-4 px-4 pb-4 border-b border-[#9facbc]">
        <strong>Relation Type:</strong>
        <div className="mb-2" />
        <Select
          value={currentRelation.type}
          onValueChange={(v) => handleConnectionTypeChange(v as EdgeType)}
        >
          <SelectTrigger className="w-[180px] p-3">
            <SelectValue>
              {(() => {
                switch (currentRelation.type) {
                  case EdgeType.Connected: return 'Connected to';
                  case EdgeType.Transfer:  return 'Transferred to';
                  case EdgeType.Part:      return 'Part of';
                  case EdgeType.Specialization: return 'Specialization';
                  case EdgeType.Fulfilled: return 'Fulfills';
                  case EdgeType.Proxy:     return 'Proxy';
                  case EdgeType.Projection:return 'Projection';
                  case EdgeType.Equality:  return 'Same as';
                  default:                 return currentRelation.type;
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
    </div>
  );
};

export default CurrentRelation;
