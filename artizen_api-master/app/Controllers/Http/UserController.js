'use strict'

const User = use('App/Models/User');
const Hash = use('Hash');

class UserController {
    async index({ response }) {
        try {
          // Fetch all users from the database
          const users = await User.all()
    
          return response.json(users)
        } catch (error) {
          // Handle errors
          console.error('Error fetching users:', error.message)
          return response.status(500).json({ error: 'Failed to fetch users' })
        }
      }

      async findById({ params, response }) {
        try {

          const user = await User.find(params.id)
    
          if (!user) {
            return response.status(404).json({ error: 'User not found' })
          }

          console.log('user: ', user);
    
          return response.json(user)
        } catch (error) {
          // Handle errors
          console.error('Error fetching user by ID:', error.message)
          return response.status(500).json({ error: 'Failed to fetch user' })
        }
      }

      async updateRole({ params, request, response }) {
        try {
          const user = await User.find(params.id)
    
          if (!user) {
            return response.status(404).json({ error: 'User not found' })
          }
      
          user.merge(request.only(['role']))
    
          await user.save()
    
          return response.json(user)
        } catch (error) {
          console.error('Error updating user:', error.message);
          return response.status(500).json({ error: 'Failed to update user' });
        }
      }
      async delete({ params, response }) {
        try {
          const user = await User.find(params.id);
      
          if (!user) {
            return response.status(404).json({ error: 'User not found' });
          }
 
          await user.delete();
      
          return response.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
          console.error('Error deleting User:', error.message);
          return response.status(500).json({ error: 'Failed to delete User' });
        }
      }
      async update({ params, request, response }) {
        try {
          const user = await User.find(params.id);
      
          if (!user) {
            return response.status(404).json({ error: 'User not found' });
          }
      
          const data = request.only(['name', 'surname', 'email', 'role', 'contacts']);
      
          user.merge(data);
          await user.save();
      
          return response.json(user);
        } catch (error) {
          console.error('Error updating user:', error.message);
          return response.status(500).json({ error: 'Failed to update user' });
        }
      }

      async activation({ params, request, response }) {
        try {
          const user = await User.find(params.id);
    
          if (!user) {
            return response.status(404).json({ error: 'User not found' });
          }
    
          user.status = user.status === 'active' ? 'inactive' : 'active';
    
          await user.save();
    
          return response.json(user);
        } catch (error) {
          console.error('Error updating user:', error.message);
          return response.status(500).json({ error: 'Failed to update user' });
        }
      }
}

module.exports = UserController
