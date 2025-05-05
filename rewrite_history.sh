#!/bin/bash

git filter-branch --env-filter '
if [ "$GIT_COMMITTER_EMAIL" = "41469830-ayeshazafardar8@users.noreply.replit.com" ]
then
    export GIT_COMMITTER_NAME="AyeshaZafarDar"
    export GIT_COMMITTER_EMAIL="ayeshazafardar3114@gmail.com"
fi
if [ "$GIT_AUTHOR_EMAIL" = "41469830-ayeshazafardar8@users.noreply.replit.com" ]
then
    export GIT_AUTHOR_NAME="AyeshaZafarDar"
    export GIT_AUTHOR_EMAIL="ayeshazafardar3114@gmail.com"
fi
' --tag-name-filter cat -- --branches --tags 