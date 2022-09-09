---
title: "How to Connect to a Remote Server!"
summary: "Need to quickly learn how to connect to a remote server? This post will show you how to (1) connect to a remote server, and 2) mount the server folders on your computer on Windows/Linux."
date: 2020-08-01T16:04:19-07:00
tags: [ "software" ]

draft: false
links:
  alias: connecting_to_remote_servers
---

<style>
.note {
  background-color: #f7e6c8;
  border-left: 6px solid #edc57e;
  margin-bottom: 10px;
}
</style>


Need to quickly learn how to connect to a remote server?

This post will show you how to (1) connect to a remote server, and 2) <sup><strong>1</strong></sup>mount the server folders on your computer on Windows/Linux.


{{< table_of_contents >}}

---

# 1. Access via ssh (Secure Shell)

Prepare three things: 1) the **username** of your server account, 2) the server <b>IP address</b>, and 3) the **password** associated with the account, if applicable. 

Open your shell. On Windows, this could by the Command Prompt or the Powershell.

The command is "ssh" followed by your server username, "@", and the server ip address. After which, you may be prompted by the console to input your password.

It should look something like the following:

```shell
$ ssh username@125.950.26.789
password:
```

 After placing your password, you should be connected. Congratulations!


<div class="note">
<b>NOTE</b>: This connection is temporary and will be gone once you exit the shell, or when your machine is powered off or loses connection to the internet. If so, you will need to enter the command again.
</div>


<br>

# 2. Mounting server files via sshfs

SSHFS is Linux-based and doesn't come installed. See below on how to install it, and the command to mount server files on your computer.


## On Windows

First, download and install google's latest win-sshfs package by clicking <a href="https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/win-sshfs/win-sshfs-0.0.1.5-setup.exe">here</a>. After doing this, you can simply input the following into your command line. 

```shell
net use \\sshfs/username@ip_address//

## More examples
# To connect at specific file path
net use \\sshfs/username@ip_address/path/to/file

# To enter password with command
net use \\sshfs\username@ip_address//file-path /user:username password    # space between file path and /user: argument

# To restore connection whenever booting
net use \\sshfs/username@ip_address// /persistent:yes

```
<div class="note">
<b>NOTE</b>: On windows, <i>"net use"</i> is the command used to map network drives to your computer.
</div>

## On Linux

Similar to Windows, you have to install sshfs for Debian, but this can all be done in the terminal! Follow the steps below to install, then mount the remote server on your machine...


```shell
# Install SSHFS
sudo apt-get install sshfs

# OPT: Create directory to mount server files on
sudo mkdir /mnt/mydir

# Mount
sudo sshfs -o allow_other,default_permissions username@ip_address:/file_path /mnt/mydir
```

<div class="note">
<b>NOTE</b>: Be careful of spaces!
</div>

---

# Additional Resources
* <a href="https://www.digitalocean.com/community/tutorials/how-to-use-sshfs-to-mount-remote-file-systems-over-ssh" target="_blank">SSHFS Mounting</a>

<br>

<sup><b>1</sup>mount</b> ::= having the remote server's files on your local machine, accessible by file explorer.
