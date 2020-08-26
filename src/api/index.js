import * as User from './user'
import * as Activity from './activity'
import * as Project from './project'
export default {
  // user
  getUser: User.getUser,
  getUserById: User.getUserById,

  // project
  getProject: Project.getProject,

  // activity
  getActivity: Activity.default.getActivity,
}
