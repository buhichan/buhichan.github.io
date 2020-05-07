
# 冷热 Observable

一些人把冷热定义为主动和被动, 但是这并没有触及核心, 还有一种更准确的定义, 就是
- 冷的Observable, 是可预料的
    - 如果通知的生产者是观察者订阅 observable 时创建的，那么 observable 就是冷的
    - 因此, 每个Observer都能收到一个独立的订阅, 并且这个订阅只能被这个Observer占有
        - 多播, 也就是从冷的Observable创建一个热的Observable(Subject), 可以让这个订阅被多个Observer共享
        - publish 只是对 multicast 的封装, 没什么意义
        - multicast 会创建一个ConnectableObservable
            - 为什么会需要这个ConnectableObservable的概念呢?
            - 因为从冷的Observable到热的Observable需要有一个从冷Observable订阅, 然后从Subject推送的过程, 这个过程不能是自动触发的.
        - refCount的作用就是自动根据多播创建的Subject的订阅数来决定是否应该从Observable订阅还是取消订阅
- 热的Observable, 是不可预料的
    - 如果通知的生产者不是每次观察者订阅 observable 时创建的，那么 observable 就是热的
    - 因此, 不管有几个Observer都必须共享一个流