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
summary: ''
authors: []
lastmod: '2020-08-01T21:43:49-04:00'
featured: no
image:
  caption: ''
  focal_point: ''
  preview_only: no
projects: []
---

Working from home?

You might be one of us who need to connect to a remote server from home. Now, how do you do this? Maybe it's better to ask first what is your operating system (e.g. Windows, MacOS, etc.). 

This post will show you 1) how to ***connect to a remote server*** on Windows, AND 2) how to ****mount*** the server on your computer on Windows and Debian. 

This blog post assumes you know basic Unix commands. If not, I recommend learning some of the basics, then come back when you're done!

<br>

### 1. Simple access to server files via ssh (Secure Shell)
Before you start, you'll most likely be needing 3 things: 1) the **username** of your server account, 2) the server **IP adress**, and 3) the password associated with the server account if applicable. Okay, now open your command prompt via cmd.exe. Your command prompt command should generally follow what is displayed below.

```
C:Users/...> ssh username@125.950.26.789            #format is ssh host@ip_address
```

Now, you may be prompted by the console to input your password. After doing so, you should be connected. Congratulations!

However, note that this connection will be gone once you exit the command prompt, or when your machine is powered off or loses internet, then you would need to connect again

<br>
<br>

Soon enough, you'll realize that having to do this often becomes annoying. Another option is to mount the server files, then you'll be able to view the files on your machine as if they were just any files on your desktop.


### 2.. Mounting server files via ssfhs













### Additional Resources
* <a href="https://www.digitalocean.com/community/tutorials/how-to-use-sshfs-to-mount-remote-file-systems-over-ssh" target="_blank">SSHFS Mounting</a>


***Mounting** simply means having the remote server's files on your local machine to access.