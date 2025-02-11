# IMF Editor <img src="images/IMF-Editor.png" alt="Description" width="200" />


Welcome to IMF Editor 🛠️, a robust and versatile tool for creating, updating, and managing nodes and their relationships. This application provides a dynamic environment 🌐 where users can not only create and modify nodes but also establish and adjust edges that define the connections between them. 

Whether you're looking to visualize complex networks, design workflows, or map out systems, our Node Editor offers the flexibility and power 🔌 needed to translate your ideas into actionable diagrams.

## Introduction 🎬

IMF Editor is a web-based platform designed for creating, updating, and managing nodes and their interconnections. Built with React and Vite on the frontend and powered by a .NET backend with SQLite, this tool offers a user-friendly interface for complex data manipulation and visualization. 

Ideal for software developers, project managers, and system architects, it allows for detailed mapping of database schemas, designing workflows, and planning network configurations. It provides a secure, scalable solution for handling various project demands while ensuring data integrity with role-based authentication using JWT. Whether you're sketching out organizational structures or documenting system designs, this tool equips you with the tools to bring precision and clarity to your projects. 🛠️🔐

## Core Features 🚀

- **Node Operations**: Users can effortlessly add, modify, or remove nodes as per their project requirements. 🎨
- **Edge Management**: Define and edit relationships with simple yet powerful tools that allow you to connect nodes through various types of edges, such as connected by, part of, fulfills etc. 🔗
- **Interactive Visualization**: With React Flow, visualize complex diagrams that are not only easy to navigate but also pleasing to the eye. 📊
- **Data Persistence**: Changes are backed by a .NET and SQLite backend, allowing for robust data management and recovery. 💾
- **Export/Import Capability**: Nodes and their relationships can be downloaded providing a simple way to share and document network structures outside the platform. 📁
- **Role-Based Authentication**: Secure access with JWT (JSON Web Tokens) for handling different user roles, ensuring that sensitive project data remains protected and accessible only to authorized personnel. 🔐

## Prerequisites 📋

Before you get started, make sure you have the following requirements in place:

- [.NET Core SDK](https://dotnet.microsoft.com/download) (v8.0.203) - Verify by running `dotnet --version` ✔️
- [npm](https://www.npmjs.com/) (v10.5.0) - Verify by running `npm --version` ✔️
- [node](https://nodejs.org/en) (v20.12.0) - Verify by running `node --version` ✔️

## Setup ⚙️

To get a local copy up and running, follow these simple steps from your terminal:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MathiasCK/node-editor.git
   ```

2. **Navigate to the project folder**

   ```bash
   cd node-editor
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

## Running the Project 🚀

### Development Mode 🔧

1. **Start both the server and client**:

   ```bash
   npm run start:dev
   ```

The server will be accessible at [http://localhost:5000](http://localhost:5000), and the client will be running on [http://localhost:5173](http://localhost:5173).

### Production Mode 🌐

1. **Build the client**:

   ```bash
   npm run client:build
   ```

2. **Start both the server and client**:

   ```bash
   npm start
   ```

The server will be accessible at [http://localhost:5000](http://localhost:5000), and the client will be running on [http://localhost:3000](http://localhost:3000).

### Logging In 🔑

- **Default Credentials**:

  - **Username**: `admin`
  - **Password**: `admin`

## Testing 🧪

The server tests are located in the `/server/Controllers/Tests`

To run these tests, you can use the following command in your terminal:

```bash
npm run server:test
```

## Tools & Dependencies 🛠️🧰

### Backend Dependencies 🖥️

The backend relies on several .NET packages to handle various functionalities:

- **Authentication 🔐**
  - **[Microsoft.AspNetCore.Authentication.JwtBearer](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer/)** (v8.0.3) - Supports JWT Bearer token authentication.

- **Database Integration 🗄️**
  - **[Microsoft.EntityFrameworkCore](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore/)** (v8.0.3) - For data access and modeling using SQL.
  - **[Microsoft.EntityFrameworkCore.Sqlite](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Sqlite/)** (v8.0.3) - Provides SQLite database support.
  
- **Design Support 🎨**
  - **[Microsoft.EntityFrameworkCore.Design](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Design/)** (v8.0.3) - Essential for using EF Core tools.

- **Security Tokens 🔑**
  - **[System.IdentityModel.Tokens.Jwt](https://www.nuget.org/packages/System.IdentityModel.Tokens.Jwt/)** (v7.5.0) - Manages JWTs for secure data transfer.

### Frontend Dependencies 🌐

The frontend architecture is enhanced with modern tools and libraries categorized by their utility:

- **Graphical Interfaces & Workflow Visualization 📊**
  - **[React Flow](https://reactflow.dev/)** - A library for building interactive node-based editors, diagrams, and workflows.

- **State Management 🔄**
  - **[Zustand](https://github.com/pmndrs/zustand)** - A simple, yet powerful state management solution.

- **Form Handling & Validation ✅**
  - **[Zod](https://github.com/colinhacks/zod)** - TypeScript-first schema definition and validation.
  - **[React Hook Form](https://react-hook-form.com/)** - Simplifies form handling and validation.

- **Styling & UI Components 🎨**
  - **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework.
  - **[Styled Components](https://styled-components.com/)** - For component-specific styling using CSS in JS.
  - **[Shadcn/UI](https://github.com/shadcn/ui)** - Reusable React UI components.
  - **[Lucide React](https://github.com/lucide-icons/lucide)** - React icons library for modern web apps.





