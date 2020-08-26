const Projects = [
  {
    username: 'Dessie',
    avatar: '/static/avatar/default.png',
    name: 'Template PSD',
    deadline: '2 days later',
    progress: 90,
    color: 'pink',
  },
  {
    username: 'Jakayla',
    avatar: '/static/avatar/default.png',
    name: 'Logo Design',
    deadline: '1 weeks later',
    progress: 70,
    color: 'success',
  },
  {
    username: 'Ludwiczakpawel',
    avatar: '/static/avatar/default.png',
    name: 'REST API',
    deadline: '1 Month later',
    progress: 50,
    color: 'info',
  },
  {
    username: 'Damenleeturks',
    avatar: '/static/avatar/default.png',
    name: 'API Unit Test',
    deadline: '2 Month later',
    progress: 30,
    color: 'teal',
  },
  {
    username: 'Caspergrl',
    avatar: '/static/avatar/default.png',
    name: 'Project Deploy',
    deadline: 'half year later',
    progress: 15,
    color: 'grey',
  },
]

const getProject = limit => {
  return limit ? Projects.slice(0, limit) : Projects
}

export { Projects, getProject }
