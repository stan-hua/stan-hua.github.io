---
title: Connecting to a remote server
author: ''
date: '2020-08-01'
slug: connecting-to-remote-servers-via-ssfhs-ssh
categories:
  - Others
tags:
  - Other
subtitle: ''
summary: 'Adapting to remote work, learn quickly how to connect to a remote server from home using SSH and SSHFS!'
authors: []
lastmod: '2020-08-02'
featured: no
image:
  caption: ''
  focal_point: ''
  preview_only: no
projects: []
---
<style>
body {background-color: #476e52 !important;}
h3,h4{color: #e3e0bc !important;}
.note{font-size: 10pt;
      line-height: 20pt;
      padding-bottom: 10px}
p{text-indent: 2em;}

details{font-size: 10pt;}
summary{font-size: 100% !important;}
</style>


Working from home?

You might be one of us who need to connect to a remote server from home. Now, how do you do this? Maybe it's better to ask first what is your operating system (e.g. Windows, MacOS, etc.). 

This post will show you 1) how to connect to a remote server on Windows, AND 2) how to <sup><strong>1</strong></sup>mount the server on your computer on Windows and Debian. 

<div class="note">
<b>NOTE</b>: This blog post assumes you know basic Unix commands. If not, I recommend learning some of the basics, then come back when you're done!
</div>

---

### 1. Simple access to server files via ssh (Secure Shell)

<p>
Before you start, you'll most likely be needing 3 things: 1) the <b>username</b> of your server account, 2) the server <b>IP adress</b>, and 3) the password associated with the server account if applicable. Okay, now open your command prompt via cmd.exe. Your command prompt command should generally follow what is displayed below.
</p>

```
...> ssh username@125.950.26.789
```

The command is "ssh" followed by your server username, "@", and the server ip address. After which, you may be prompted by the console to input your password. After doing so, you should be connected. Congratulations!

<div class="note">
<b>NOTE</b>: This connection is temporary and will be gone once you exit the command prompt, or when your machine is powered off or loses connection to the internet. If so, you will need to enter the command again.
</div>


Soon enough, you'll realize the pain of having to do this every time you close the command prompt. Another option is to mount the server files. Then you'll be able to view the files on your machine as if they were just any files on your desktop!

<br>

### 2. Mounting server files via sshfs

SSHFS is Linux-based and doesn't come installed. See below on how to install it, and the command to mount server files on your computer.


#### On Windows

First, download and install google's latest win-sshfs package by clicking <a href="https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/win-sshfs/win-sshfs-0.0.1.5-setup.exe">here</a>. After doing this, you can simply input the following into your command line. 

```
net use \\sshfs\username@ip_address//            #// brings you to your home dir. in the server


##More examples
#To connect at specific file path
net use \\sshfs\username@ip_address//file-path
net use \\sshfs\username@ip_address//Users\Stanley\Desktop

#To enter password with command
net use \\sshfs\username@ip_address//file-path /user:username password    #space between file path and /user: argument
```
<div class="note">
<b>NOTE</b>: <i>"net use"</i> is used to map network drives to your computer.
</div>

#### On Debian

Similar to Windows, you have to install sshfs for Debian, but this can all be done in the terminal! Follow the steps below to install, then mount the remote server on your machine...


```
#Install SSHFS
sudo apt-get install sshfs

#OPT: Create directory to mount server files on
sudo mkdir /mnt/droplet

#Mount
sudo sshfs -o allow_other,default_permissions username@ip_address:/file_path /mnt/droplet
```

<div class="note">
<b>NOTE</b>: Be careful of spaces!
</div>

---

### Additional Resources
* <a href="https://www.digitalocean.com/community/tutorials/how-to-use-sshfs-to-mount-remote-file-systems-over-ssh" target="_blank">SSHFS Mounting</a>

<br>

<div class="note">
<sup><b>1</sup>Mount</b> ::= having the remote server's files on your local machine, accessible by file explorer.
</div>