#VERSION 1.1.0
#基础镜像为openjdk:12-alpine

FROM openjdk:12-alpine

#签名
MAINTAINER lots "553294090@qq.com.com"


RUN rm -rf lotswxxw*
ADD lotswxxw.jar lotswxxw.jar

CMD ["java", "-jar", "lotswxxw.jar","--spring.profiles.active=prod",">/home/java/package/lotswxxw/lotswxxw.log 2>&1 &"]