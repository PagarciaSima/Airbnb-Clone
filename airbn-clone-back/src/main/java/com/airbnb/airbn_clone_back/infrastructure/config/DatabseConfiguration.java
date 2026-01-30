package com.airbnb.airbn_clone_back.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories({"com.airbnb.airbn_clone_back.user.repository",
    "com.airbnb.airbn_clone_back.listing.repository",
    "com.airbnb.airbn_clone_back.booking.repository"})
@EnableTransactionManagement
@EnableJpaAuditing
public class DatabseConfiguration {

}
