import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Misc/button';
import { buttonVariants } from '@/lib/config.ts';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Misc/form';
import { Edit2, Plus, Minus, X, Trash2 } from 'lucide-react';
import { updateNode} from '@/api/nodes';
import { AspectType, CustomAttribute, Provenance, Scope, Range, Regularity } from '@/lib/types';
import { TextField, MenuItem } from '@mui/material';
import { useClipboard } from '@/hooks/useClipboard';

interface CurrentElementProps {
  currentElement: any;
}

const customAttributeSchema = z.object({
  name: z.string().min(1).max(25),
  value: z.string().min(1).max(25),
  unitOfMeasure: z.string().optional(),
  quantityDatums: z.object({
    provenance: z.enum(['', 'specified', 'calculated', 'measured']).optional(),
    scope: z.enum(['', 'design', 'operating']).optional(),
    range: z.enum(['', 'nominal', 'normal', 'average', 'minimum', 'maximum']).optional(),
    regularity: z.enum(['', 'continuous', 'absolute']).optional(),
  }).optional(),
});

const CurrentElement: React.FC<CurrentElementProps> = ({ currentElement }) => {
  const [editLabel, setEditLabel] = useState(false);
  const [tempName, setTempName] = useState(currentElement.data.customName || currentElement.data.label || '');
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(currentElement.data.customAttributes || []);
  const [isAttributesVisible, setIsAttributesVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showMaxLengthMsg, setShowMaxLengthMsg] = useState(false);
  const { handleTriggerDelete } = useClipboard();
  const form = useForm<z.infer<typeof customAttributeSchema>>({
    resolver: zodResolver(customAttributeSchema),
    defaultValues: {
      name: '',
      value: '',
      unitOfMeasure: '',
      quantityDatums: {
        provenance: '',
        scope: '',
        range: '',
        regularity: '',
      },
    },
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editLabel && textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // fit content
    }
  }, [editLabel]);

  useEffect(() => {
    setTempName(currentElement.data.customName || currentElement.data.label || '');
    setCustomAttributes(currentElement.data.customAttributes || []);
  }, [currentElement]);

  const handleUpdateCustomName = async () => {
    const trimmedName = tempName.trim();
    const updated = await updateNode(currentElement.id, { customName: trimmedName });
    if (updated) {
      currentElement.data.customName = trimmedName;
    }
    setEditLabel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevents newline in textarea
      handleUpdateCustomName(); // submits the name
    } else if (e.key === 'Escape') {
      setTempName(currentElement.data.customName || currentElement.data.label || '');
      setEditLabel(false); // exits editing without saving
    }
  };

  const onSubmitAttribute = async (values: z.infer<typeof customAttributeSchema>) => {
    if (editingIndex === null) {
      const newAttributes = [
        ...customAttributes,
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
      const updated = await updateNode(currentElement.id, { customAttributes: newAttributes });
      if (updated) {
        currentElement.data.customAttributes = newAttributes;
        setCustomAttributes(newAttributes);
        form.reset();
        setIsAttributesVisible(false);
      }
    } else {
      const newAttributes = customAttributes.map((attr, idx) => {
        if (idx === editingIndex) {
          return {
            name: values.name,
            value: values.value,
            unitOfMeasure: values.unitOfMeasure || '',
            quantityDatums: {
              provenance: values.quantityDatums?.provenance as Provenance,
              scope: values.quantityDatums?.scope as Scope,
              range: values.quantityDatums?.range as Range,
              regularity: values.quantityDatums?.regularity as Regularity,
            },
          };
        }
        return attr;
      });
      const updated = await updateNode(currentElement.id, { customAttributes: newAttributes });
      if (updated) {
        currentElement.data.customAttributes = newAttributes;
        setCustomAttributes(newAttributes);
        form.reset();
        setEditingIndex(null);
        setIsAttributesVisible(false);
      }
    }
  };

  const handleDeleteAttribute = async (attr: CustomAttribute) => {
    const updatedAttributes = customAttributes.filter(a => a !== attr);
    setCustomAttributes(updatedAttributes);
    const updated = await updateNode(currentElement.id, { customAttributes: updatedAttributes });
    if (updated) {
      currentElement.data.customAttributes = updatedAttributes;
    }
  };

  const handleEditAttribute = (index: number) => {
    setEditingIndex(index);
    const attribute = customAttributes[index];
    form.reset({
      name: attribute.name,
      value: attribute.value,
      unitOfMeasure: attribute.unitOfMeasure,
      quantityDatums: {
        provenance: attribute.quantityDatums?.provenance || '',
        scope: attribute.quantityDatums?.scope || '',
        range: attribute.quantityDatums?.range || '',
        regularity: attribute.quantityDatums?.regularity || '',
      },
    });
    setIsAttributesVisible(true);
  };

  const handleAspectChange = async (newAspect: AspectType) => {
    const updated = await updateNode(currentElement.id, { aspect: newAspect });
    if (updated) {
      currentElement.data.aspect = newAspect;
    }
  };
  const aspectOptions = [
    { value: AspectType.Function, label: 'Function', color: '#fff000' },
    { value: AspectType.Product, label: 'Product', color: '#00ffff' },
    { value: AspectType.Location, label: 'Location', color: '#ff00ff' },
    { value: AspectType.Installed, label: 'Installed', color: '#424bb2' },
    { value: AspectType.NoAspect, label: 'No Aspect', color: '#E0E0E0' },
    { value: AspectType.UnspecifiedAspect, label: 'Unspecified', color: '#9E9E9E' },
  ];
  
  const filteredAspectOptions =
    currentElement.type === 'terminal'
      ? aspectOptions.filter(option => option.value !== AspectType.Location)
      : aspectOptions;
  
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="mb-2 p-4 border-b border-[#9facbc]">
        <div className="flex items-start justify-between gap-2 w-full">
          {editLabel ? (
            <div className="flex flex-col flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                rows={1}
                className="w-full bg-transparent text-black dark:text-white resize-none focus:outline-none overflow-hidden break-words border"
                style={{
                  wordBreak: 'break-word',
                  minHeight: '1.5em', // Gives it breathing room
                  height: 'auto',
                  overflow: 'hidden', // Prevents scroll
                }}
                value={tempName}
                autoFocus
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 50) {
                    setTempName(val);
                    setShowMaxLengthMsg(false);
                  } else {
                    setShowMaxLengthMsg(true);
                  }

                  // Auto-grow as user types
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                  }
                }}
                onBlur={handleUpdateCustomName}
                onKeyDown={handleKeyDown}
              />

              {showMaxLengthMsg && (
                <span className="text-xs text-red-500 mt-1">
                  Maximum of 50 characters reached
                </span>
              )}
            </div>
          ) : (
            <div
              className="flex-1 min-w-0"
              onDoubleClick={() => {
                setTempName(currentElement.data.customName || currentElement.data.label || '');
                setEditLabel(true);
              }}
            >
              <p
                className="flex-grow cursor-pointer flex items-center break-all"
                style={{ wordBreak: 'break-word' }}
                title="Double-click to edit name"
              >
                {currentElement.data.customName || currentElement.data.label || 'N/A'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {!editLabel && (
              <Edit2
                size={18}
                className="text-blue-500 cursor-pointer"
                onClick={() => {
                  setTempName(currentElement.data.customName || currentElement.data.label || '');
                  setEditLabel(true);
                }}
              />
            )}
            <Trash2
              size={18}
              onClick={handleTriggerDelete}
              className="text-red-700 cursor-pointer"
            />
          </div>
        </div>
      </div>


      {/* Aspect Type */}
      <div className="mb-4 px-4 pb-4 border-b border-[#9facbc]">
        <div className="font-semibold">Aspect</div>
        <div className="mb-2"></div>
        <TextField
          select
          variant="outlined"
          value={currentElement.data.aspect}
          onChange={(e) => handleAspectChange(e.target.value as AspectType)}
          size="small"
          fullWidth
          className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
          dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
          dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
          dark:[&_.MuiInputBase-input]:text-[#9facbc]
          dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
          dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
          dark:[&_.MuiInputLabel-root]:text-white
          dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
          dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white
          dark:[&_.MuiSelect-icon]:text-white"
          >
          {filteredAspectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    height: '10px',
                    width: '10px',
                    backgroundColor: option.color,
                    borderRadius: '50%',
                    marginRight: '10px',
                  }}
                ></span>
                {option.label}
              </span>
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Custom Attributes Section */}
      <div className="flex-1 pb-12 px-4 h-96 overflow-hidden">
        <div className="flex justify-between items-center mb-2 relative">
          <p className="text-black dark:text-white">
            <div className="font-semibold">Attributes</div>
          </p>
          <div className="relative">
            {!isAttributesVisible ? (
              <span title="Add new attribute">
                <Plus
                  onClick={() => {
                    form.reset({
                      name: '',
                      value: '',
                      unitOfMeasure: '',
                      quantityDatums: {
                        provenance: '',
                        scope: '',
                        range: '',
                        regularity: '',
                      },
                    });
                    setEditingIndex(null);
                    setIsAttributesVisible(true);
                  }}
                  className="text-black dark:text-white hover:cursor-pointer"
                  size={18}
                />
              </span>
            ) : (
              <span title="Close">
                <Minus
                  onClick={() => {
                    form.reset();
                    setIsAttributesVisible(false);
                    setEditingIndex(null);
                  }}
                  className="text-red-500 hover:cursor-pointer"
                  size={18}
                />
              </span>
            )}

            {/* Create Attribute Menu */}
            {isAttributesVisible && (
              <div className="fixed top-64 right-56 w-80 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
                <div className="flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc]">
                  <h2 className="font-semibold">{editingIndex === null ? 'Create Attribute' : 'Edit Attribute'}</h2>
                  <span className="cursor-pointer" title="Close" onClick={() => setIsAttributesVisible(false)}>
                    <X size={18} />
                  </span>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitAttribute)} className="p-4 pt-0">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextField
                              {...field}
                              label="Name"
                              variant="outlined"
                              size="small"
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
                    <div className="flex flex-row mt-4 gap-2">
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
                          </FormControl>
                        )}
                      />
                    </div>
                    {/* Quantity Datums Section */}
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground dark:text-white mb-3">Quantity Datums</p>
                      <div className="grid grid-cols-2 gap-2">
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
                                  className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                                    dark:[&_.MuiInputBase-input]:text-[#9facbc]
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiSelect-icon]:text-white"
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
                                  className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                                    dark:[&_.MuiInputBase-input]:text-[#9facbc]
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiSelect-icon]:text-white"
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
                                  className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                                    dark:[&_.MuiInputBase-input]:text-[#9facbc]
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiSelect-icon]:text-white"
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
                                  className="dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                                    dark:[&_.MuiInputBase-input]:text-[#9facbc]
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                                    dark:[&_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white
                                    dark:[&_.MuiSelect-icon]:text-white"
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
                    <div className="flex justify-center mt-4">
                    <Button
                  type="submit"
                  className={`w-1/2 ${buttonVariants.confirm}`}
                  size="sm"
                >
                        {editingIndex === null ? 'Add' : 'Update'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>


      {/* List existing custom attributes */}
      {customAttributes.length > 0 && (
        <div
          className="border border-[#9facbc] h-full
          overflow-y-auto
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-white
          [&::-webkit-scrollbar-thumb]:bg-gray-200
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700
          dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
          [scrollbar-width:thin] 
          [scrollbar-color:lightGray_transparent]"
        >
          {customAttributes.map((attr, index) => (
            <div key={index} className="flex border-b p-2">
              <div className="flex w-full items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold break-words break-all">{attr.name}</span>
                    </div>
                    <div title="Attribute actions" className="flex items-center space-x-1 ml-2">
                      <Edit2
                        size={16}
                        className="cursor-pointer text-blue-500"
                        onClick={() => handleEditAttribute(index)}
                      />
                      <Minus
                        size={20}
                        onClick={() => handleDeleteAttribute(attr)}
                        className="cursor-pointer text-red-500"
                      />
                    </div>
                  </div>
                  <div className="text-sm break-words"></div>
                  <div className="text-sm break-words">{attr.value}<span className="italic">{attr.unitOfMeasure ? ` ${attr.unitOfMeasure}` : ''}</span></div>
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
      )}
            </div>
    </div>
  );
};

export default CurrentElement;