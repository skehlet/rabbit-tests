docker-compose up -d

VBoxManage controlvm default natpf1 tcp-5672,tcp,,5672,,5672
VBoxManage showvminfo default

# Why through `bash` and `&& true`?
# https://github.com/docker-library/rabbitmq/issues/68#issuecomment-183548502
docker run -it --rm \
	--link rabbittests_rabbit1_1:rabbit1 \
	-e RABBITMQ_ERLANG_COOKIE=R9smcF42S5SMcQrkXXT5 \
	-e RABBITMQ_NODENAME=rabbit@rabbit1 \
	rabbitmq:3 \
	bash -c 'rabbitmqctl list_queues list_queues name messages_ready messages_unacknowledged && true'

# https://www.rabbitmq.com/tutorials/tutorial-one-java.html

javac -cp rabbitmq-client.jar Send.java Recv.java

java -cp .:commons-io-1.2.jar:commons-cli-1.1.jar:rabbitmq-client.jar Send

java -cp .:commons-io-1.2.jar:commons-cli-1.1.jar:rabbitmq-client.jar Recv
