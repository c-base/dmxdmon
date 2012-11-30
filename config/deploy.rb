set :application, "dmxdmon"
set :repository,  "git://dev.c-base.org/libart-dmxcontrol/dmxdmon.git"
set :scm, 'git'

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

role :web, "baseos.cbrp3.c-base.org"                          # Your HTTP server, Apache/etc

set :home_path, "/srv/capistranos/dmxdmon"
set :deploy_to, "/srv/capistranos/dmxdmon"
set :shared_children, %w(system log pids config)
set :user, "deployer"

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
#   task :start do ; end
#   task :stop do ; end
#   task :restart, :roles => :app, :except => { :no_release => true } do
#     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
    task :restart, :roles => :app do
      run "#{try_sudo} /etc/init.d/apache2 restart"
    end
    task :finalize_update do
    end
 end
