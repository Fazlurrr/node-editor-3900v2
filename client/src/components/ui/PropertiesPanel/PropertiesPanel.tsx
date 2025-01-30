import { deleteNode, updateNode } from '@/api/nodes';
import { Trash, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Node, Edge } from 'reactflow';
import Modal from '@/components/ui/Modal';

interface PropertiesPanelProps {
  selectedElement: Node | Edge | null; // Accept either a Node or an Edge
}

interface CustomAttribute {
  name: string;
  value: string;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {

  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);
  const { register, handleSubmit, reset } = useForm<CustomAttribute>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedElement && 'data' in selectedElement) {
      setCustomAttributes(selectedElement.data.customAttributes || []);
    }
  }, [selectedElement]);

  const handleDeleteAttribute = async (attr: CustomAttribute) => {
    const updatedAttributes = customAttributes.filter(a => a !== attr);
    setCustomAttributes(updatedAttributes);

    if (selectedElement && 'data' in selectedElement) {
      await updateNode(selectedElement.id, { customAttributes: updatedAttributes });
    }
  };

  const handleDeleteElement = async () => {
    if (selectedElement) {
      await deleteNode(selectedElement.id);
      setIsModalOpen(false);
    }
  };

  const onSubmit = async (data: CustomAttribute) => {
    const newAttributes = [...customAttributes, data];
    setCustomAttributes(newAttributes);

    if (selectedElement && 'data' in selectedElement) {
      await updateNode(selectedElement.id, { customAttributes: newAttributes });
      reset();
    }
  };

  return (
    <div className="h-full w-56 text-black border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10">
      <div className="p-4 mt-14 mb-2 border-b border-[#9facbc]">
        <h2 className="text-lg text-black dark:text-white font-semibold">Properties</h2>
      </div>
      <div className="p-4 overflow-auto">
        {selectedElement ? (
          <>
            <p className="mb-2 text-black dark:text-white">
              <strong>ID:</strong> {selectedElement.id}
            </p>
            {'data' in selectedElement && (
                <>
                  <p className="mb-2 text-black dark:text-white">
                    <strong>Label:</strong> {selectedElement.data.label || 'N/A'}
                  </p>
                  <p className="mb-2 text-black dark:text-white">
                    <strong>Type:</strong> {selectedElement.type}
                  </p>
                  <p className="mb-2 text-black dark:text-white">
                    <strong>Created:</strong> {new Date(selectedElement.data.createdAt).toLocaleString()}
                  </p>
                  <p className="mb-2 text-black dark:text-white">
                    <strong>Updated:</strong> {new Date(selectedElement.data.updatedAt).toLocaleString()}
                  </p>
                  {'position' in selectedElement && (
                    <p className="mb-2 text-black dark:text-white">
                    <strong>Position:</strong> ({selectedElement.position.x.toFixed(2)}, {selectedElement.position.y.toFixed(2)})
                    </p>
                  )}
                  <p className="mb-2 text-black dark:text-white"><strong>Custom Attributes:</strong></p>
                  <form onSubmit={handleSubmit(onSubmit)} className="my-2">
                    <div className="flex flex-col gap-1 mb-1">
                      <input {...register('name')} placeholder="Name" className="border p-1 text-sm" required />
                      <input {...register('value')} placeholder="Value" className="border p-1 text-sm" required />
                      <button type="submit" className="bg-blue-500 hover:bg-blue-700 p-1 text-sm rounded font-bold text-white dark:text-white">Add</button>
                    </div>
                  </form>
                  {customAttributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center mb-1 text-black dark:text-white">
                    <span className="text-sm w-40 break-words">{attr.name}: {attr.value}</span>
                    <Trash size={16} onClick={() => handleDeleteAttribute(attr)} className="cursor-pointer text-red-500"/>
                    </div>
                  ))}

                    <button onClick={() => setIsModalOpen(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 
                    rounded hover:bg-red-700 justify-center w-full mt-16">
                      Delete Node
                    </button>
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDelete={handleDeleteElement}>
                        <div className='text-center text-black dark:text-black font-semibold text-xl p-4'>
                          Confirm Deletion
                        </div>
                      <div className='text-center text-black dark:text-black'>
                          Are you sure you want to delete this node? <br/>
                          Any edges or references to this node will be deleted. <br/>
                          This action cannot be undone.
                      </div>
                    </Modal>
                </>
            )}
          </>
        ) : (
          <p>No element selected</p>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;



