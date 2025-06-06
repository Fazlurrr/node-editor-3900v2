# <img src="client/public/logo-light.png" alt="Description" width="25"/> IMF Editor 

**Welcome to IMF Editor**, a comprehensive and flexible tool for designing and managing engineering system models within the Information Modelling Framework. This application provides a graphical user interface where users can create and modify elements, as well as their relationships, attributes, and properties.
Built with React and Vite on the frontend and a .NET backend with SQLite, this tool offers a user-friendly interface for designing and managing system models.
Ideal for engineers, project managers, and system architects, it enables detailed mapping of engineering systems.The application ensures effective collaboration and streamlined information exchange in today’s dynamic engineering environments.

## Core Features

- **Element Operations**: Users can easily add, modify, or remove elements based on their project requirements.
- **Relation Management**: Users can connect elements, modify the type or direction of existing relationships, or remove them when needed. The tool supports various relation types such as connected by, part of, and fulfills, enabling clear and flexible system modeling.
- **User-Focused Design**: Tailored for engineers, our UX emphasizes intuitive workflows, fast navigation, personalization settings, and minimal friction in everyday tasks.
- **Data Persistence**: Changes are backed by a .NET and SQLite backend, allowing for robust data management and recovery.
- **Export/Import Capability**: Models can be exported in various formats, providing a simple way to store and share projects. This includes a custom “.imf” file extension, as well as: “.rdf”, “.png”, and “.svg”.
- **Role-Based Authentication**: Secure access with JWT (JSON Web Tokens) supports different user roles, ensuring sensitive project data remains protected and accessible only to authorized personnel.
- **Onboarding Support**: Includes a help menu featuring a tutorial, IMF documentation, IMF Guru, and a keyboard shortcut list.

## Prerequisites

Before you get started, make sure you have the following requirements in place:

- [.NET Core SDK](https://dotnet.microsoft.com/download) (v8.0.203) - Verify by running `dotnet --version`
- [npm](https://www.npmjs.com/) (v10.5.0) - Verify by running `npm --version`
- [node](https://nodejs.org/en) (v20.12.0) - Verify by running `node --version`

## Setup

To get a local copy up and running, follow these simple steps from your terminal:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Fazlurrr/imf-editor.git
   ```

2. **Navigate to the project folder**

   ```bash
   cd imf-editor
   ```

3. **Install root & client dependencies**

   ```bash
   npm install
   ```

4. **Install server dependencies**

   ```bash
   npm run server:init
   ```

5. **Build server**

   ```bash
   npm run server:build
   ```

## Running the Project 

### Development Mode 

1. **Start both the server and client**:

   ```bash
   npm run start:dev
   ```

The server will be accessible at [http://localhost:5000](http://localhost:5000), and the client will be running on [http://localhost:5173](http://localhost:5173).

### Production Mode 

1. **Build the client**:

   ```bash
   npm run client:build
   ```

2. **Start both the server and client**:

   ```bash
   npm start
   ```

The server will be accessible at [http://localhost:5000](http://localhost:5000), and the client will be running on [http://localhost:3000](http://localhost:3000).

### Logging In 

- **Default Credentials**:

  - **Username**: `admin`
  - **Password**: `admin`

## Testing 

The server tests are located in the `/server/Controllers/Tests`

To run these tests, you can use the following command in your terminal:

```bash
npm run server:test
```

## Tools & Dependencies

### Backend Dependencies 

The backend relies on several .NET packages to handle various functionalities:

- **Authentication**
  - **[Microsoft.AspNetCore.Authentication.JwtBearer](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer/)** (v8.0.3) - Supports JWT Bearer token authentication.

- **Database Integration**
  - **[Microsoft.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore/)** (v8.0.3) - For data access and modeling using SQL.
  - **[Microsoft.EntityFrameworkCore.Sqlite](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Sqlite/)** (v8.0.3) - Provides SQLite database support.
  
- **Design Support**
  - **[Microsoft.EntityFrameworkCore.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Design/)** (v8.0.3) - Essential for using EF Core tools.

- **Security Tokens**
  - **[System.IdentityModel.Tokens.Jwt](https://www.nuget.org/packages/System.IdentityModel.Tokens.Jwt/)** (v7.5.0) - Manages JWTs for secure data transfer.

### Frontend Dependencies 

The frontend architecture is enhanced with modern tools and libraries categorized by their utility:

- **Graphical Interfaces & Workflow Visualization**
  - **[React Flow](https://reactflow.dev/)** - A library for building interactive node-based editors, diagrams, and workflows.

- **State Management**
  - **[Zustand](https://github.com/pmndrs/zustand)** - A simple, yet powerful state management solution.

- **Form Handling & Validation**
  - **[Zod](https://github.com/colinhacks/zod)** - TypeScript-first schema definition and validation.
  - **[React Hook Form](https://react-hook-form.com/)** - Simplifies form handling and validation.

- **Styling & UI Components**
  - **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework.
  - **[Styled Components](https://styled-components.com/)** - For component-specific styling using CSS in JS.
  - **[Shadcn/UI](https://github.com/shadcn/ui)** - Reusable React UI components.
  - **[Material UI components](https://mui.com/material-ui/all-components/)** - Minimalist React components used for input fields.
  - **[Lucide React](https://github.com/lucide-icons/lucide)** - React icons library for modern web apps.
 
- **Accessibility and Usability**
  - **[React HotKeys](https://www.npmjs.com/package/react-hotkeys-hook)** - Enables custom keyboard shortcuts for flexible and efficient interaction.
  - **[React Toastify](https://www.npmjs.com/package/react-toastify)** - Displays customizable toast notifications for user feedback and alerts. 




