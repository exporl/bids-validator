ExpORL custum changes of the bids-validator. 

# installation: 
make sure you have node installed (https://nodejs.org/en/download/package-manager; node version >= 18.0.0; npm version >= 7)
clone the repository (git clone https://github.com/exporl/bids-validator)
make the installation (cd bids-validator/bids-validator; npm install)

# update the original bids-validator respository with: 
git remote add upstream https://github.com/bids-standard/bids-validator.git
git fetch upstream
(solve merge conflicts in case this is necessary)
