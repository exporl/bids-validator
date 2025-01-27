ExpORL custum changes of the bids-validator. 

# TO DO 
- check online bids validator -- wrong database name (should be checked where this originates from)
- node error:  Warning: Closing directory handle on garbage collection -- prevent this warning

# installation: 
make sure you have node installed (https://nodejs.org/en/download/package-manager; node version >= 18.0.0; npm version >= 7)
clone the repository (git clone https://github.com/exporl/bids-validator)
make the installation (cd bids-validator/bids-validator; npm install)

# update the original bids-validator respository with: 
git remote add upstream https://github.com/bids-standard/bids-validator.git
git fetch upstream
(solve merge conflicts in case this is necessary)

# Technical setup ---- provided by Linus ones (important to update the bids validator web version)
The code for the bids-validator is hosted on github at https://github.com/exporl/bids-validator. This is a fork of the official upstream github project hosted at https://github.com/bids-standard/bids-validator. Some ExpORL specific rules were added regarding apx and apr files.

At the time of writing the official bids-validator project is very volatile and might be subject to some upcoming changes. Take this into account when trying to reproduce the steps described here. Some steps might be outdated. Please don't hesitate to update this documentation when you notice such discrepancies.

## Jenkins job
A jenkins job monitors compliance of datasets residing on the archive shared drive. This job uses the git repository, ensures all dependencies are installed (nodejs and 'npm install'), and runs the validator against all datasets that are expected to be compliant. A failing build signals non-compliance. The output can be consulted to investigate which datasets isn't compliant, and which rules were triggered.

https://exporl.med.kuleuven.be/jenkins/view/All/job/bids/

## Deploying the online bids-validator
An online version of the bids-validator is available at https://exporl.gbiomed.kuleuven.be/bids-validator. This version includes the ExpORL specific rules. This web application can be deployed with the following steps:
- prerequisite: you need access to the webserver where the online version is hosted. In this case make sure you have access to gbw-s-exporl03.luna.kuleuven.be. (This can be asked to Renzo - the IT/Apex guy-, he can give you access to the deployment user to fix this change)
- get a clone of the git repository at https://github.com/exporl/bids-validator
- ensure a recent nodejs (v16+) installation is available. At the time of writing a recent version of npm (v7+) is required (because workspaces are used), which ships with nodejs v16+. See https://nodejs.org for installation instructions suitable for your environment. You can check your node version with 'node -v'. Consider using [https://github.com/nvm-sh/nvm nvm] to install and manage your nodejs environment.
- in the repository directory run <pre>npm install</pre>
- in the repository directory run <pre>npm run web-export</pre>
- copy the contents from the generated directory at 'bids-validator-web/out' to the webserver (gbw-s-exporl03.luna.kuleuven.be). On linux you can for example do <pre>rsync -rzvh --delete ./bids-validator-web/out/. gbw-s-exporl03.luna.kuleuven.be:/var/www/html/bids-validator</pre> (Check: your ssh path migth be different!)
- the online version should now be available at https://exporl.gbiomed.kuleuven.be/bids-validator

## Integrate new changes and upstream changes from the official bids-validator project
To add new rules, simply create a new commit for the github project at https://github.com/exporl/bids-validator. Don't forget to deploy this new version with the steps described above. The changes will be automatically picked up by the daily jenkins job.

To pull in new development from the upstream project at https://github.com/bids-standard/bids-validator, you can use the github web interface (search for 'fetch upstream'), or you can simply pull from within your local git repository with the command <pre>git pull --rebase=false https://github.com/bids-standard/bids-validator v1.7.1</pre> (replace version with whatever version you wish to merge in) and push the result to origin again with <pre>git push</pre>
