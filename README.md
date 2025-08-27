# Tasks Distributor System

A comprehensive task management system built with MERN stack (MongoDB, Express.js, React.js, Node.js) that allows agents to distribute tasks to sub-agents.

## Features

- **Admin Management**: Create and manage agents
- **Agent Dashboard**: View assigned tasks and sub-agents
- **Sub-Agent Management**: Create and manage sub-agents
- **Task Distribution**: Distribute tasks from agents to sub-agents
- **Real-time Updates**: Tasks are removed from agent's list after distribution
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS

## Task Distribution Workflow

1. **Agent Login**: Agent logs into the system
2. **View Tasks**: Agent sees all tasks assigned to them
3. **Select Tasks**: Agent selects specific tasks to distribute
4. **Select Sub-Agents**: Agent selects sub-agents to receive tasks
5. **Distribute**: System automatically distributes tasks evenly among selected sub-agents
6. **Update**: Tasks are removed from agent's list and assigned to sub-agents

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Tasks_Distributor_System/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   JWT_SECRET=your-secret-key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Tasks_Distributor_System/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Agent Routes (`/api/agent`)

- `GET /sub-agents` - Get all sub-agents for the logged-in agent
- `POST /sub-agents` - Create a new sub-agent
- `GET /tasks` - Get all tasks assigned to the agent
- `POST /tasks/distribute` - Distribute selected tasks to selected sub-agents

### Task Distribution

The task distribution endpoint accepts a distribution object:

```json
{
  "distribution": {
    "subAgentId1": ["taskId1", "taskId2"],
    "subAgentId2": ["taskId3"]
  }
}
```

## How to Use Task Distribution

1. **Navigate to Tasks Page**: Click "Manage Tasks" from the agent dashboard
2. **Select Tasks**: Check the checkboxes next to tasks you want to distribute
3. **Select Sub-Agents**: Check the checkboxes next to sub-agents who will receive tasks
4. **Click Distribute**: The system will automatically:
   - Calculate even distribution of tasks among sub-agents
   - Update task assignments in the database
   - Remove distributed tasks from your agent task list
   - Update sub-agent task counts
   - Show success message

## Database Models

### Task Model
- `firstName`: Customer's first name
- `phone`: Customer's phone number
- `notes`: Additional notes about the task
- `assignedTo`: ID of the agent/sub-agent assigned to the task
- `assignedToModel`: Type of user assigned ('Agent' or 'SubAgent')
- `assignedBy`: ID of the admin/agent who assigned the task
- `assignedByModel`: Type of user who assigned ('Admin' or 'Agent')
- `status`: Task status ('pending', 'in-progress', 'completed')

### SubAgent Model
- `name`: Sub-agent's full name
- `email`: Sub-agent's email address
- `password`: Hashed password
- `mobileNumber`: Sub-agent's mobile number
- `agent`: Reference to the parent agent
- `tasks`: Array of task IDs assigned to this sub-agent

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected API endpoints
- Input validation and sanitization

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Vite, Tailwind CSS
- **Authentication**: JWT, bcrypt
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Troubleshooting

### Common Issues

1. **Tasks not updating**: Ensure the backend server is running and MongoDB is connected
2. **Authentication errors**: Check if the JWT token is valid and not expired
3. **CORS errors**: Verify the proxy configuration in `vite.config.js`
4. **Database connection**: Ensure MongoDB is running and the connection string is correct

### Error Handling

The system includes comprehensive error handling:
- Network errors are caught and displayed to users
- Validation errors show specific messages
- Authentication errors redirect to login
- Database errors are logged and handled gracefully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.