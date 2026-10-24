export const projects = {
  favourites: [
    { name: 'Website Revamp', color: 'bg-teal-400' },
    { name: 'Mobile App', color: 'bg-sky-400' },
  ],
  all: [
    { name: 'Website Revamp', color: 'bg-teal-400' },
    { name: 'Mobile App', color: 'bg-sky-400' },
    { name: 'Marketing Plan', color: 'bg-amber-400' },
    { name: 'API Migration', color: 'bg-rose-400' },
    { name: 'Client Portal', color: 'bg-emerald-400' },
  ],
}

export const team = ['RK', 'AS', 'MP', 'NV', 'SJ']

export const columns = [
  {
    title: 'To Do',
    tasks: [
      {
        id: 'WR-112', title: 'Design onboarding screens',
        desc: 'Wireframes for the 3-step signup flow.',
        priority: 'High', category: 'Design',
        done: 1, total: 5, due: 'Oct 29',
        assignees: ['AS', 'MP'], comments: 4, files: 2,
      },
      {
        id: 'WR-115', title: 'Write REST API documentation',
        desc: 'Document auth and project endpoints.',
        priority: 'Low', category: 'Backend',
        done: 0, total: 4, due: 'Nov 03',
        assignees: ['RK'], comments: 0, files: 1,
      },
    ],
  },
  {
    title: 'In Progress',
    tasks: [
      {
        id: 'WR-104', title: 'Build Kanban board component',
        desc: 'Drag-and-drop columns with task cards.',
        priority: 'Medium', category: 'Frontend',
        done: 3, total: 6, due: 'Oct 27',
        assignees: ['RK', 'NV', 'SJ'], comments: 7, files: 3,
      },
      {
        id: 'WR-108', title: 'JWT authentication flow',
        desc: 'Signup, login and protected routes.',
        priority: 'High', category: 'Backend',
        done: 2, total: 4, due: 'Oct 26',
        assignees: ['NV'], comments: 3, files: 0,
      },
    ],
  },
  {
    title: 'Done',
    tasks: [
      {
        id: 'WR-101', title: 'Project setup and repo structure',
        desc: 'Vite, Tailwind, Express and Git configured.',
        priority: 'Low', category: 'Setup',
        done: 4, total: 4, due: 'Oct 24',
        assignees: ['RK', 'AS'], comments: 2, files: 1,
      },
    ],
  },
]