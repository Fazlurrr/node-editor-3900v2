const commonStyles =
  'border-2 bg-transparent uppercase font-bold cursor-pointer transition duration-300 ease-in-out outline-none m-5 hover:text-white hover:border-transparent';

export const buttonVariants = {
  edge: `${commonStyles} border-black-300 text-black-300   w-1/3   hover:bg-white text-white`,
  button: `${commonStyles} px-5 py-2.5 border-black  text-black hover:bg-black`,
  block: `${commonStyles} px-5 py-2.5 border-block text-block hover:bg-block`,
  connector: `${commonStyles} px-5 py-2.5 border-connector  text-connector hover:bg-connector`,
  terminal: `${commonStyles} px-5 py-2.5 border-terminal  text-terminal hover:bg-terminal`,
  confirm:
    'bg-[#232528] border-[#232528] border-2 text-white hover:bg-white hover:text-[#232528] dark:bg-white dark:border-white dark:text-[#232528] dark:hover:bg-[#232528] dark:hover:text-white',
  cancel:
    'bg-white border-[#475C66] border-2 text-[#475C66] hover:bg-[#475C66] hover:text-white dark:bg-[#232528] dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#232528]',
  danger:
    'bg-red-500 border-red-500 border-2 text-white hover:bg-white hover:text-red-500 dark:hover:bg-[#232528] dark:hover:text-red-500',
  verbose:
    'border-yellow-500 dark:border-yellow-500 text-yellow-500 dark:text-yellow-500 hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500 dark:hover:text-white',
};
