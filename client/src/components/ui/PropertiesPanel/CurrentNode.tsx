import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Input } from '../input';
import { Button } from '../button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../form';
import { Trash, Edit2, Plus, Minus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { updateNode, deleteNode } from '@/api/nodes';
import { AspectType, CustomAttribute, Provenance, Scope, Range, Regularity } from '@/lib/types';
import { TextField, MenuItem } from '@mui/material';

interface CurrentNodeProps {
  currentNode: any;
}

const customAttributeSchema = z.object({
  name: z.string().min(1).max(25),
  value: z.string().min(1).max(25),
  unitOfMeasure: z.string().optional(),
  quantityDatums: z.object({
    provenance: z.enum(['','specified', 'calculated', 'measured']).optional(),
    scope: z.enum(['','design', 'operating']).optional(),
    range: z.enum(['','nominal', 'normal', 'average', 'minimum', 'maximum']).optional(),
    regularity: z.enum(['','continuous', 'absolute']).optional(),
  }).optional(),
});

const CurrentNode: React.FC<CurrentNodeProps> = ({ currentNode }) => {
  const [label, setLabel] = useState(currentNode.data.label || '');
  const [editLabel, setEditLabel] = useState(false);
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(currentNode.data.customAttributes || []);
  const [isAttributesVisible, setIsAttributesVisible] = useState(false);

  const form = useForm<z.infer<typeof customAttributeSchema>>({
    resolver: zodResolver(customAttributeSchema),
    defaultValues: {
      name: '',
      value: '',
      unitOfMeasure: '',
      quantityDatums: {
        provenance: undefined,
        scope: undefined,
        range: undefined,
        regularity: undefined,
      },
    },
  });

  useEffect(() => {
    setLabel(currentNode.data.label || '');
    setCustomAttributes(currentNode.data.customAttributes || []);
  }, [currentNode]);

  const handleUpdateLabel = async () => {
    const updated = await updateNode(currentNode.id, { label });
    if (updated) {
      currentNode.data.label = label;
    }
    setEditLabel(false);
  };

  const addCustomAttribute = async (values: z.infer<typeof customAttributeSchema>) => {
    const newAttributes = [
      ...currentNode.data.customAttributes,
      {
        name: values.name,
        value: values.value,
        unitOfMeasure: values.unitOfMeasure || '',
        quantityDatums: {
          provenance: values.quantityDatums?.provenance as Provenance,
          scope: values.quantityDatums?.scope as Scope,
          range: values.quantityDatums?.range as Range,
          regularity: values.quantityDatums?.regularity as Regularity,
        },
      },
    ];
    const updated = await updateNode(currentNode.id, { customAttributes: newAttributes });
    if (updated) {
      currentNode.data.customAttributes = newAttributes;
      setCustomAttributes(newAttributes);
      form.reset();
      setIsAttributesVisible(false);
      toast.success('Attribute added');
    }
  };

  const handleDeleteAttribute = async (attr: CustomAttribute) => {
    const updatedAttributes = customAttributes.filter(a => a !== attr);
    setCustomAttributes(updatedAttributes);
    const updated = await updateNode(currentNode.id, { customAttributes: updatedAttributes });
    if (updated) {
      currentNode.data.customAttributes = updatedAttributes;
      toast.success('Attribute deleted');
    }
  };

  const handleDeleteNode = async () => {
    const deleted = await deleteNode(currentNode.id);
    if (deleted) {
      toast.success('Node deleted');
    }
  };

  const handleAspectChange = async (newAspect: AspectType) => {
    const updated = await updateNode(currentNode.id, { aspect: newAspect });
    if (updated) {
      currentNode.data.aspect = newAspect;
      toast.success('Aspect updated');
    }
  };

  return (
    <div className="">
      {/* Node Name and Edit */}
      <div className="mb-2 p-4">
        <strong>Name:</strong>{' '}
        {editLabel ? (
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleUpdateLabel}
            autoFocus
          />
        ) : (
          <span onClick={() => setEditLabel(true)} className="cursor-pointer">
            {label || 'N/A'} <Edit2 size={18} className="inline ml-1" />
          </span>
        )}
      </div>

      {/* Aspect Type */}
      <div className="mb-4 px-4 pb-4 border-b border-[#9facbc]">
        <strong>Aspect type:</strong>
        <TextField
          select
          variant="outlined"
          value={currentNode.data.aspect}
          onChange={(e) => handleAspectChange(e.target.value as AspectType)}
          size="small"
          fullWidth
        >
          <MenuItem value={AspectType.Function}>Function</MenuItem>
          <MenuItem value={AspectType.Product}>Product</MenuItem>
          <MenuItem value={AspectType.Location}>Location</MenuItem>
          <MenuItem value={AspectType.Installed}>Installed</MenuItem>
          <MenuItem value={AspectType.NoAspect}>No Aspect</MenuItem>
          <MenuItem value={AspectType.UnspecifiedAspect}>Unspecified Aspect</MenuItem>
        </TextField>
      </div>

      {/* Custom Attributes Section */}
      <div className="mb-4 px-4 border-b border-[#9facbc]">
        <Form {...form}>
          <form className="my-4" onSubmit={form.handleSubmit(addCustomAttribute)}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-black dark:text-white"><strong>Custom attributes</strong></p>
              {!isAttributesVisible ? (
                <Plus
                  onClick={() => setIsAttributesVisible(true)}
                  className="text-black dark:text-white hover:cursor-pointer"
                  size={18}
                />
              ) : (
                <Minus
                  onClick={() => {
                    form.reset();
                    setIsAttributesVisible(false);
                  }}
                  className="text-red-500 hover:cursor-pointer"
                  size={18}
                />
              )}
            </div>

            {isAttributesVisible && (
              <div className="form-select w-full text-black dark:text-white ">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormControl>
                      <FormItem>
                        <FormControl>
                          <TextField
                            {...field}
                            label="Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ mt: 2 }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormControl>
                      <FormItem>
                        <FormControl>
                          <TextField
                            {...field}
                            label="Value"
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ mt: 2 }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitOfMeasure"
                  render={({ field }) => (
                    <FormControl>
                      <FormItem>
                        <FormControl>
                          <TextField
                            {...field}
                            label="Unit"
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ mt: 2 }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </FormControl>
                  )}
                />
                {/* Quantity Datums Section */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-3">Quantity Datums</p>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="quantityDatums.provenance"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextField
                              select
                              {...field}
                              label="Provenance"
                              variant="outlined"
                              size="small"
                              fullWidth
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="specified">Specified</MenuItem>
                              <MenuItem value="calculated">Calculated</MenuItem>
                              <MenuItem value="measured">Measured</MenuItem>
                            </TextField>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantityDatums.scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextField
                              select
                              {...field}
                              label="Scope"
                              variant="outlined"
                              size="small"
                              fullWidth
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="design">Design</MenuItem>
                              <MenuItem value="operating">Operating</MenuItem>
                            </TextField>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantityDatums.range"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextField
                              select
                              {...field}
                              label="Range"
                              variant="outlined"
                              size="small"
                              fullWidth
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="nominal">Nominal</MenuItem>
                              <MenuItem value="normal">Normal</MenuItem>
                              <MenuItem value="average">Average</MenuItem>
                              <MenuItem value="minimum">Minimum</MenuItem>
                              <MenuItem value="maximum">Maximum</MenuItem>
                            </TextField>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantityDatums.regularity"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextField
                              select
                              {...field}
                              label="Regularity"
                              variant="outlined"
                              size="small"
                              fullWidth
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="continuous">Continuous</MenuItem>
                              <MenuItem value="absolute">Absolute</MenuItem>
                            </TextField>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full my-2 bg-blue-500 hover:bg-blue-700 text-white" size="sm">
                  Add
                </Button>
              </div>
            )}
          </form>
        </Form>
        {/* List existing custom attributes with quantity datum info */}
        <div className="mb-4 border border-[#9facbc] max-h-80
        overflow-y-auto
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-white
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
        [scrollbar-width:thin] 
        [scrollbar-color:lightGray_transparent]">
          {customAttributes.map((attr, index) => (
            <div key={index} className="flex border-b p-2">
                <div className="flex w-full items-center justify-between">
                <div className='w-full'>
                  <div className='flex items-center justify-between'>
                  <strong className="text-sm break-words">{attr.name}</strong>
                  <Minus
                    size={20}
                    onClick={() => handleDeleteAttribute(attr)}
                    className="cursor-pointer text-red-500 ml-2"
                  />
                  </div>
                  <div className="text-sm break-words">
                  {attr.value}
                  </div>
                  <div className="text-sm break-words">
                  {attr.unitOfMeasure ? ` (${attr.unitOfMeasure})` : ''}
                  </div>
                  {(attr.quantityDatums?.provenance ||
                    attr.quantityDatums?.scope ||
                    attr.quantityDatums?.range ||
                    attr.quantityDatums?.regularity) && (
                    <div className="text-sm text-gray-600">
                      {attr.quantityDatums.provenance && (
                        <div>
                          <span className="font-medium">Provenance:</span> {attr.quantityDatums.provenance}
                        </div>
                      )}
                      {attr.quantityDatums.scope && (
                        <div>
                          <span className="font-medium">Scope:</span> {attr.quantityDatums.scope}
                        </div>
                      )}
                      {attr.quantityDatums.range && (
                        <div>
                          <span className="font-medium">Range:</span> {attr.quantityDatums.range}
                        </div>
                      )}
                      {attr.quantityDatums.regularity && (
                        <div>
                          <span className="font-medium">Regularity:</span> {attr.quantityDatums.regularity}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Node Alert */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="mx-4 mb-4">
            <Button className="mt-4 bg-red-500 text-white w-full block" variant="outline">
              Delete Node
            </Button>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this node?</AlertDialogTitle>
            <AlertDialogDescription>
              Any edges or references to this node will be deleted. You can undo this action if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNode}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurrentNode;
