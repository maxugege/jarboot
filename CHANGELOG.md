## 1.0.9 (8.14, 2021)

* refactor bytes command (重构查看字节码命令)
* fix upload file and download file 401 error
* task filter by workspace
* fix request error when token expire
* fix command cli parse not use default when not require
#### FEATURES:
* add dump command

## 1.0.8 (8.7, 2021)

* refactor command protocol (重构命令执行协议)
* stdout default on, and change from session to broadcast (stdout命令默认开启，改为广播级，将广播到所有客户端)
* 启动完成判定时间改为由VM参数传入，原配置文件中的该项配置废弃
* 重构消息交互机制，优化性能
#### FEATURES:
* Agent api and command SPI （增加api主动通知启动完成接口，自定义命令SPI扩展，支持用户自己开发命令）
* When import <code>spring-boot-starter-jarboot</code>, spring.env and spring.bean command added
* add help command
* add ognl command
* add sm command
* add sysenv command
* add tt command
* add stack command
* add pwd command

## 1.0.7 (7.25, 2021)

* [#13] Command line parse error when space in quotation
* Rename module name from jarboot-service to jarboot-server
* Show the current version when start
* Fix priority sorted error
* Refactor modify some url api, service boot properties
* fastjson -> jackson
* code format add p3c, sonar, dependency and findbugs plugins
* Global config move in jarboot.properties
#### FEATURES:
* Support jar file, working directory and jdk path using absolute path or relative path.
* jarboot.properties add jarboot.services.enable-auto-start-after-start config.
* Server vm option from a file, and can edit in ui.
* Server start main arguments edit ui.
* Architecture optimization to support more concurrent terminal messages.
* Add startup.sh startup.cmd shutdown.sh shutdown.cmd file to start or shutdown jarboot server.
* Services sorted by name.
* Remove swagger-ui

## 1.0.6 (7.11, 2021)

#### FEATURES:

* User manager and permission control.
