package com.mz.jarboot;

import com.mz.jarboot.api.AgentService;
import com.mz.jarboot.api.JarbootFactory;
import com.mz.jarboot.api.cmd.spi.CommandProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

/**
 * @author majianzheng
 */
@ConditionalOnProperty(name = "spring.jarboot.enabled", matchIfMissing = true)
@EnableConfigurationProperties({ JarbootConfigProperties.class })
public class JarbootAutoConfiguration {
    private static final String FACTORY_CLASS = "com.mz.jarboot.api.JarbootFactory";

    @Bean
    @ConditionalOnClass(name = {Constants.AGENT_CLASS, FACTORY_CLASS})
    public AgentService agentService() {
        return JarbootFactory.createAgentService();
    }

    @Bean("spring.env")
    @ConditionalOnClass(name = Constants.AGENT_CLASS)
    public CommandProcessor springEnv(Environment environment) {
        return new com.mz.jarboot.command.SpringEnvCommandProcessor(environment);
    }

    @Bean("spring.bean")
    @ConditionalOnClass(name = Constants.AGENT_CLASS)
    public CommandProcessor springBean(ApplicationContext context) {
        return new com.mz.jarboot.command.SpringBeanCommandProcessor(context);
    }
}
