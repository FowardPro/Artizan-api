const User = use('App/Models/User');
const Mail = use('Mail');

class AuthController {
  async login({ request, response }) {
    const { email, password } = request.only(['email', 'password']);
  
    try {
      const user = await User.findByOrFail('email', email);

      const passwordVerified = (password == user.password);
  
      if (!passwordVerified) {
        return response.status(400).json({ error: 'Invalid password' });
      }
  
      return response.ok({ data: { user } });
    } catch (error) {
      console.error('Error during login:', error);
      return response.status(400).json({ error: 'Invalid credentials' });
    }
  }
  
  async passwordReset({ request, response }) {
    const { email } = request.only(['email']);
  
    try {
      const user = await User.findByOrFail('email', email);

      if(user) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';

        let password = '';
        
        for (let i = 0; i < 10; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const emailData = {
          tempPassword: password,
          username: `${user.name} ${user.surname}`
        };
  
        user.password = password;
        await user.save();

        await Mail.send('emails.password', emailData, (message) => {
          message.from('no-reply@artizen.com');
          message.to(user.email)
          message.subject('Password Reset')
        });
        return response.ok({ data: { user } });
      } else {

        return response.ok({ data: 'Password Sent' });

      }
    } catch (error) {
      console.error('Error during login:', error);
      return response.status(400).json({ error: error });
    }
  }

  async register({ request, response }) {
    const { 
      name,
      surname,
      role,
      email,
      contact,
      password
    } = request.only([ 'name', 'surname', 'role', 'email', 'contact', 'password'])

    const user = new User();
    user.name = name;
    user.surname = surname;
    user.role = role;
    user.username = email;
    user.email = email;
    user.password = password;
    user.contacts = contact;

    await user.save()

    return response.created(user)
  }
}

module.exports = AuthController
